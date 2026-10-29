package com.portfolio.portfolio.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.portfolio.portfolio.dto.AuthResponse;
import com.portfolio.portfolio.dto.LoginRequest;
import com.portfolio.portfolio.dto.LoginResult;
import com.portfolio.portfolio.dto.RefreshTokenResult;
import com.portfolio.portfolio.dto.RegisterRequest;
import com.portfolio.portfolio.entity.PasswordResetToken;
import com.portfolio.portfolio.entity.RefreshToken;
import com.portfolio.portfolio.entity.User;
import com.portfolio.portfolio.message.MessageCatalog;
import com.portfolio.portfolio.repository.PasswordResetTokenRepository;
import com.portfolio.portfolio.repository.RefreshTokenRepository;
import com.portfolio.portfolio.repository.UserRepository;
import com.portfolio.portfolio.security.JwtService;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock private UserRepository userRepository;

  @Mock private PasswordEncoder passwordEncoder;

  @Mock private JwtService jwtService;

  @Mock private RefreshTokenRepository refreshTokenRepository;

  @Mock private PasswordResetTokenRepository passwordResetTokenRepository;

  @Mock private PasswordResetNotifier passwordResetNotifier;

  @InjectMocks private AuthService authService;

  private User user;

  @BeforeEach
  void setUp() {
    user =
        User.builder()
            .id("01JUSER")
            .username("trader")
            .email("trader@example.com")
            .password("encoded-password")
            .role("USER")
            .build();
  }

  @Test
  void registersUserWithNormalizedEmail() {
    RegisterRequest request = registerRequest("Trader@example.com", "Strong123");
    when(userRepository.findByEmailIgnoreCase("trader@example.com")).thenReturn(Optional.empty());
    when(userRepository.findByUsername("trader")).thenReturn(Optional.empty());
    when(passwordEncoder.encode("Strong123")).thenReturn("encoded-password");
    when(jwtService.generateToken(any(User.class))).thenReturn("access-token");

    AuthResponse response = authService.registerAndReturnResponse(request);

    assertEquals("trader@example.com", response.email());
    assertEquals("access-token", response.token());
    ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
    verify(userRepository).save(savedUser.capture());
    assertEquals("trader@example.com", savedUser.getValue().getEmail());
    assertEquals("USER", savedUser.getValue().getRole());
  }

  @Test
  void rejectsDuplicateEmail() {
    RegisterRequest request = registerRequest("TRADER@example.com", "Strong123");
    when(userRepository.findByEmailIgnoreCase("trader@example.com")).thenReturn(Optional.of(user));

    DuplicateRegistrationException exception =
        assertThrows(
            DuplicateRegistrationException.class,
            () -> authService.registerAndReturnResponse(request));

    assertEquals(MessageCatalog.Codes.Registration.EMAIL_ALREADY_EXISTS, exception.getCode());
    verify(userRepository, never()).save(any(User.class));
  }

  @Test
  void rejectsDuplicateUsername() {
    RegisterRequest request = registerRequest("new@example.com", "Strong123");
    when(userRepository.findByEmailIgnoreCase("new@example.com")).thenReturn(Optional.empty());
    when(userRepository.findByUsername("trader")).thenReturn(Optional.of(user));

    DuplicateRegistrationException exception =
        assertThrows(
            DuplicateRegistrationException.class,
            () -> authService.registerAndReturnResponse(request));

    assertEquals(MessageCatalog.Codes.Registration.USERNAME_ALREADY_EXISTS, exception.getCode());
    verify(userRepository, never()).save(any(User.class));
  }

  @Test
  void rejectsMissingRegistrationFields() {
    DuplicateRegistrationException exception =
        assertThrows(
            DuplicateRegistrationException.class,
            () -> authService.registerAndReturnResponse(null));

    assertEquals(MessageCatalog.Codes.Validation.VALIDATION_ERROR, exception.getCode());
    verify(userRepository, never()).findByEmailIgnoreCase(any(String.class));
  }

  @Test
  void rejectsWeakPassword() {
    RegisterRequest request = registerRequest("new@example.com", "weak");

    DuplicateRegistrationException exception =
        assertThrows(
            DuplicateRegistrationException.class,
            () -> authService.registerAndReturnResponse(request));

    assertEquals(MessageCatalog.Codes.Validation.WEAK_PASSWORD, exception.getCode());
    verify(userRepository, never()).findByEmailIgnoreCase(any(String.class));
  }

  @Test
  void authenticatesUserAndStoresRefreshToken() {
    LoginRequest request = new LoginRequest();
    request.setEmail(" TRADER@example.com ");
    request.setPassword("Strong123");
    request.setRememberMe(true);
    RefreshToken refreshToken = refreshToken("refresh-hash", user);
    when(userRepository.findByEmailIgnoreCase("TRADER@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("Strong123", "encoded-password")).thenReturn(true);
    when(jwtService.generateToken(user)).thenReturn("access-token");
    when(jwtService.generateRefreshToken(user, true))
        .thenReturn(new RefreshTokenResult("raw-refresh", refreshToken));

    LoginResult result = authService.authenticate(request);

    assertEquals("access-token", result.authResponse().token());
    assertEquals("raw-refresh", result.refreshToken());
    assertTrue(result.rememberMe());
    verify(refreshTokenRepository).save(refreshToken);
  }

  @Test
  void rejectsInvalidCredentials() {
    LoginRequest request = new LoginRequest();
    request.setEmail("missing@example.com");
    request.setPassword("Strong123");
    when(userRepository.findByEmailIgnoreCase("missing@example.com")).thenReturn(Optional.empty());

    assertThrows(InvalidCredentialsException.class, () -> authService.authenticate(request));
    verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
  }

  @Test
  void rejectsBlankCredentials() {
    LoginRequest request = new LoginRequest();
    request.setEmail(" ");
    request.setPassword("Strong123");

    assertThrows(InvalidCredentialsException.class, () -> authService.authenticate(request));
    verify(userRepository, never()).findByEmailIgnoreCase(any(String.class));
  }

  @Test
  void refreshesValidTokenAndRevokesPreviousToken() {
    RefreshToken current = refreshToken("current-hash", user);
    RefreshToken replacement = refreshToken("replacement-hash", user);
    current.setRememberMe(true);
    when(jwtService.hashToken("raw-current")).thenReturn("current-hash");
    when(refreshTokenRepository.findByTokenHash("current-hash")).thenReturn(Optional.of(current));
    when(jwtService.generateRefreshToken(user, true))
        .thenReturn(new RefreshTokenResult("raw-replacement", replacement));
    when(jwtService.generateToken(user)).thenReturn("new-access-token");

    LoginResult result = authService.refresh("raw-current");

    assertTrueRevoked(current);
    assertEquals("raw-replacement", result.refreshToken());
    assertTrue(result.rememberMe());
    verify(refreshTokenRepository).save(current);
    verify(refreshTokenRepository).save(replacement);
  }

  @Test
  void rejectsExpiredRefreshToken() {
    RefreshToken expired = refreshToken("hash", user);
    expired.setExpiresAt(Instant.now().minusSeconds(1));
    when(jwtService.hashToken("raw")).thenReturn("hash");
    when(refreshTokenRepository.findByTokenHash("hash")).thenReturn(Optional.of(expired));

    assertThrows(InvalidRefreshTokenException.class, () -> authService.refresh("raw"));
    verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
  }

  @Test
  void logoutRevokesExistingTokenAndIgnoresBlankToken() {
    RefreshToken token = refreshToken("hash", user);
    when(jwtService.hashToken("raw")).thenReturn("hash");
    when(refreshTokenRepository.findByTokenHash("hash")).thenReturn(Optional.of(token));

    authService.logout("raw");
    authService.logout(" ");

    assertTrueRevoked(token);
    verify(refreshTokenRepository).save(token);
    verify(jwtService).hashToken("raw");
  }

  @Test
  void revokeAllRevokesEveryUserToken() {
    RefreshToken current = refreshToken("current", user);
    RefreshToken other = refreshToken("other", user);
    when(jwtService.hashToken("raw")).thenReturn("current");
    when(refreshTokenRepository.findByTokenHash("current")).thenReturn(Optional.of(current));
    when(refreshTokenRepository.findByUser(user)).thenReturn(List.of(current, other));

    authService.revokeAll("raw");

    assertTrueRevoked(current);
    assertTrueRevoked(other);
    verify(refreshTokenRepository).save(current);
    verify(refreshTokenRepository).save(other);
  }

  @Test
  void createsGoogleUserWithVerifiedIdentityAndRefreshSession() {
    RefreshToken refreshToken = refreshToken("google-refresh-hash", user);
    when(userRepository.findByGoogleSubject("google-subject")).thenReturn(Optional.empty());
    when(userRepository.findByEmailIgnoreCase("google@example.com")).thenReturn(Optional.empty());
    when(userRepository.findByUsername("googletrader")).thenReturn(Optional.empty());
    when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
    when(jwtService.generateOpaqueToken()).thenReturn("random-password");
    when(passwordEncoder.encode("random-password")).thenReturn("opaque-password-hash");
    when(jwtService.generateRefreshToken(any(User.class), eq(false)))
        .thenReturn(new RefreshTokenResult("google-refresh", refreshToken));
    when(jwtService.generateToken(any(User.class))).thenReturn("google-access");

    LoginResult result =
        authService.authenticateGoogle(
            "google-subject", "Google@example.com", "Google Trader", false);

    assertEquals("google-access", result.authResponse().token());
    assertEquals("google@example.com", result.authResponse().email());
    ArgumentCaptor<User> savedUser = ArgumentCaptor.forClass(User.class);
    verify(userRepository).save(savedUser.capture());
    assertEquals("google-subject", savedUser.getValue().getGoogleSubject());
    assertEquals("googletrader", savedUser.getValue().getUsername());
  }

  @Test
  void rejectsLinkingEmailAlreadyLinkedToAnotherGoogleIdentity() {
    user.setGoogleSubject("different-google-subject");
    when(userRepository.findByGoogleSubject("google-subject")).thenReturn(Optional.empty());
    when(userRepository.findByEmailIgnoreCase("trader@example.com")).thenReturn(Optional.of(user));

    assertThrows(
        InvalidGoogleCredentialException.class,
        () ->
            authService.authenticateGoogle(
                "google-subject", "trader@example.com", "Trader", false));

    verify(refreshTokenRepository, never()).save(any(RefreshToken.class));
  }

  @Test
  void passwordResetRequestDoesNotDiscloseUnknownEmail() {
    when(passwordResetNotifier.isConfigured()).thenReturn(true);
    when(userRepository.findByEmailIgnoreCaseForUpdate("missing@example.com"))
        .thenReturn(Optional.empty());

    authService.requestPasswordReset(" Missing@example.com ");

    verify(passwordResetTokenRepository, never()).save(any(PasswordResetToken.class));
    verify(passwordResetNotifier, never()).sendResetLink(any(String.class), any(String.class));
  }

  @Test
  void passwordResetStoresOnlyHashAndSendsRawTokenOutOfBand() {
    when(passwordResetNotifier.isConfigured()).thenReturn(true);
    when(userRepository.findByEmailIgnoreCaseForUpdate("trader@example.com"))
        .thenReturn(Optional.of(user));
    when(jwtService.generateOpaqueToken()).thenReturn("one-time-token");
    when(jwtService.hashToken("one-time-token")).thenReturn("hashed-one-time-token");

    authService.requestPasswordReset("TRADER@example.com");

    ArgumentCaptor<PasswordResetToken> tokenCaptor =
        ArgumentCaptor.forClass(PasswordResetToken.class);
    verify(passwordResetTokenRepository).save(tokenCaptor.capture());
    assertEquals("hashed-one-time-token", tokenCaptor.getValue().getTokenHash());
    assertTrue(tokenCaptor.getValue().getExpiresAt().isAfter(Instant.now()));
    verify(passwordResetNotifier).sendResetLink("trader@example.com", "one-time-token");
  }

  @Test
  void resetsPasswordConsumesTokenAndRevokesRefreshSessions() {
    PasswordResetToken resetToken =
        PasswordResetToken.builder()
            .tokenHash("reset-hash")
            .user(user)
            .expiresAt(Instant.now().plusSeconds(600))
            .used(false)
            .build();
    RefreshToken existingRefreshToken = refreshToken("refresh-hash", user);
    when(jwtService.hashToken("raw-reset-token")).thenReturn("reset-hash");
    when(passwordResetTokenRepository.findByTokenHash("reset-hash"))
        .thenReturn(Optional.of(resetToken));
    when(passwordEncoder.encode("NewStrong123")).thenReturn("new-encoded-password");
    when(userRepository.save(user)).thenReturn(user);
    when(refreshTokenRepository.findByUser(user)).thenReturn(List.of(existingRefreshToken));

    authService.resetPassword("raw-reset-token", "NewStrong123");

    assertTrue(resetToken.isUsed());
    assertEquals("new-encoded-password", user.getPassword());
    assertTrueRevoked(existingRefreshToken);
    verify(passwordResetTokenRepository).invalidateUnusedByUser(user);
  }

  @Test
  void rejectsWeakPasswordDuringReset() {
    PasswordResetToken resetToken =
        PasswordResetToken.builder()
            .tokenHash("reset-hash")
            .user(user)
            .expiresAt(Instant.now().plusSeconds(600))
            .used(false)
            .build();
    when(jwtService.hashToken("raw-reset-token")).thenReturn("reset-hash");
    when(passwordResetTokenRepository.findByTokenHash("reset-hash"))
        .thenReturn(Optional.of(resetToken));

    DuplicateRegistrationException exception =
        assertThrows(
            DuplicateRegistrationException.class,
            () -> authService.resetPassword("raw-reset-token", "weak"));

    assertEquals(MessageCatalog.Codes.Validation.WEAK_PASSWORD, exception.getCode());
    verify(userRepository, never()).save(any(User.class));
  }

  private RegisterRequest registerRequest(String email, String password) {
    RegisterRequest request = new RegisterRequest();
    request.setUserName("trader");
    request.setEmail(email);
    request.setPassword(password);
    return request;
  }

  private RefreshToken refreshToken(String hash, User tokenUser) {
    return RefreshToken.builder()
        .tokenHash(hash)
        .user(tokenUser)
        .expiresAt(Instant.now().plusSeconds(3600))
        .revoked(false)
        .build();
  }

  private void assertTrueRevoked(RefreshToken token) {
    assertTrue(token.isRevoked());
    assertSame(user, token.getUser());
  }
}
