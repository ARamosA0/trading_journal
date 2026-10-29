package com.portfolio.portfolio.service;

import com.github.f4b6a3.ulid.UlidCreator;
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
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

  private static final Logger LOGGER = LoggerFactory.getLogger(AuthService.class);
  private static final Duration PASSWORD_RESET_LIFETIME = Duration.ofMinutes(15);

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final RefreshTokenRepository refreshTokenRepository;
  private final PasswordResetTokenRepository passwordResetTokenRepository;
  private final PasswordResetNotifier passwordResetNotifier;

  @Transactional
  public AuthResponse registerAndReturnResponse(RegisterRequest request) {
    validateRegistration(request);
    String email = request.getEmail().trim().toLowerCase(Locale.ROOT);

    if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
      throw new DuplicateRegistrationException(
          MessageCatalog.Codes.Registration.EMAIL_ALREADY_EXISTS);
    }

    if (userRepository.findByUsername(request.getUserName()).isPresent()) {
      throw new DuplicateRegistrationException(
          MessageCatalog.Codes.Registration.USERNAME_ALREADY_EXISTS);
    }

    User user = new User();

    user.setId(UlidCreator.getUlid().toString());
    user.setUsername(request.getUserName());

    user.setEmail(email);

    user.setPassword(passwordEncoder.encode(request.getPassword()));

    user.setRole("USER");

    userRepository.save(user);

    String token = jwtService.generateToken(user);
    return new AuthResponse(
        token, user.getId(), user.getEmail(), user.getUsername(), user.getRole());
  }

  public LoginResult authenticate(LoginRequest request) {

    if (request == null
        || request.getEmail() == null
        || request.getPassword() == null
        || request.getEmail().isBlank()
        || request.getPassword().isBlank()) {
      throw new InvalidCredentialsException();
    }

    User user =
        userRepository
            .findByEmailIgnoreCase(request.getEmail().trim())
            .orElseThrow(InvalidCredentialsException::new);

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new InvalidCredentialsException();
    }

    return createLoginResult(user, request.isRememberMe());
  }

  @Transactional
  public LoginResult authenticateGoogle(
      String googleSubject, String rawEmail, String name, boolean rememberMe) {
    if (googleSubject == null
        || googleSubject.isBlank()
        || rawEmail == null
        || rawEmail.isBlank()
        || !rawEmail.contains("@")) {
      throw new InvalidGoogleCredentialException();
    }

    String email = rawEmail.trim().toLowerCase(Locale.ROOT);
    User user =
        userRepository
            .findByGoogleSubject(googleSubject)
            .orElseGet(
                () -> {
                  Optional<User> existingAccount = userRepository.findByEmailIgnoreCase(email);
                  if (existingAccount.isPresent()) {
                    User linkedUser = existingAccount.get();
                    if (linkedUser.getGoogleSubject() != null
                        && !linkedUser.getGoogleSubject().equals(googleSubject)) {
                      throw new InvalidGoogleCredentialException();
                    }
                    linkedUser.setGoogleSubject(googleSubject);
                    return userRepository.save(linkedUser);
                  }

                  User newUser = new User();
                  newUser.setId(UlidCreator.getUlid().toString());
                  newUser.setUsername(uniqueGoogleUsername(name, email));
                  newUser.setEmail(email);
                  newUser.setPassword(passwordEncoder.encode(jwtService.generateOpaqueToken()));
                  newUser.setRole("USER");
                  newUser.setGoogleSubject(googleSubject);
                  return userRepository.save(newUser);
                });

    return createLoginResult(user, rememberMe);
  }

  @Transactional
  public void requestPasswordReset(String rawEmail) {
    if (rawEmail == null || rawEmail.isBlank() || !passwordResetNotifier.isConfigured()) {
      return;
    }

    String email = rawEmail.trim().toLowerCase(Locale.ROOT);
    Optional<User> matchingUser = userRepository.findByEmailIgnoreCaseForUpdate(email);
    if (matchingUser.isEmpty()) {
      return;
    }

    User user = matchingUser.get();
    passwordResetTokenRepository.invalidateUnusedByUser(user);

    String rawToken = jwtService.generateOpaqueToken();
    PasswordResetToken resetToken =
        PasswordResetToken.builder()
            .tokenHash(jwtService.hashToken(rawToken))
            .user(user)
            .expiresAt(Instant.now().plus(PASSWORD_RESET_LIFETIME))
            .used(false)
            .build();
    passwordResetTokenRepository.save(resetToken);

    try {
      passwordResetNotifier.sendResetLink(email, rawToken);
    } catch (RuntimeException exception) {
      resetToken.consume();
      passwordResetTokenRepository.save(resetToken);
      LOGGER.warn("Password reset email delivery failed; the token was invalidated.");
    }
  }

  @Transactional
  public void resetPassword(String rawToken, String newPassword) {
    if (rawToken == null || rawToken.isBlank()) {
      throw new InvalidPasswordResetTokenException();
    }

    PasswordResetToken resetToken =
        passwordResetTokenRepository
            .findByTokenHash(jwtService.hashToken(rawToken))
            .filter(token -> !token.isUsed() && token.getExpiresAt().isAfter(Instant.now()))
            .orElseThrow(InvalidPasswordResetTokenException::new);

    validatePassword(newPassword);
    User user = resetToken.getUser();
    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);

    resetToken.consume();
    passwordResetTokenRepository.save(resetToken);
    passwordResetTokenRepository.invalidateUnusedByUser(user);

    refreshTokenRepository
        .findByUser(user)
        .forEach(
            token -> {
              token.setRevoked(true);
              refreshTokenRepository.save(token);
            });
  }

  private void validateRegistration(RegisterRequest request) {
    if (request == null
        || request.getUserName() == null
        || request.getUserName().isBlank()
        || request.getEmail() == null
        || request.getEmail().isBlank()
        || request.getPassword() == null
        || request.getPassword().isBlank()) {
      throw new DuplicateRegistrationException(MessageCatalog.Codes.Validation.VALIDATION_ERROR);
    }

    validatePassword(request.getPassword());
  }

  private void validatePassword(String password) {
    if (password == null
        || password.length() < 8
        || !password.matches(".*[A-Z].*")
        || !password.matches(".*[a-z].*")
        || !password.matches(".*[0-9].*")) {
      throw new DuplicateRegistrationException(MessageCatalog.Codes.Validation.WEAK_PASSWORD);
    }
  }

  private LoginResult createLoginResult(User user, boolean rememberMe) {
    RefreshTokenResult refreshToken = jwtService.generateRefreshToken(user, rememberMe);
    refreshTokenRepository.save(refreshToken.entity());

    AuthResponse response =
        new AuthResponse(
            jwtService.generateToken(user),
            user.getId(),
            user.getEmail(),
            user.getUsername(),
            user.getRole());
    return new LoginResult(response, refreshToken.refreshToken(), rememberMe);
  }

  private String uniqueGoogleUsername(String name, String email) {
    String base = name == null || name.isBlank() ? email.substring(0, email.indexOf('@')) : name;
    String username = base.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9_.-]", "");
    if (username.isBlank()) {
      username = "trader";
    }
    if (username.length() > 64) {
      username = username.substring(0, 64);
    }
    if (userRepository.findByUsername(username).isEmpty()) {
      return username;
    }

    String suffix = UlidCreator.getUlid().toString().substring(0, 8).toLowerCase(Locale.ROOT);
    int baseLength = Math.min(username.length(), 64 - suffix.length() - 1);
    return username.substring(0, baseLength) + "-" + suffix;
  }

  @Transactional
  public LoginResult refresh(String rawRefreshToken) {
    RefreshToken currentToken = findValidRefreshToken(rawRefreshToken);
    currentToken.setRevoked(true);
    refreshTokenRepository.save(currentToken);

    User user = currentToken.getUser();
    boolean rememberMe = currentToken.isRememberMe();
    RefreshTokenResult replacement = jwtService.generateRefreshToken(user, rememberMe);
    refreshTokenRepository.save(replacement.entity());

    AuthResponse response =
        new AuthResponse(
            jwtService.generateToken(user),
            user.getId(),
            user.getEmail(),
            user.getUsername(),
            user.getRole());

    return new LoginResult(response, replacement.refreshToken(), rememberMe);
  }

  @Transactional
  public void logout(String rawRefreshToken) {
    if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
      return;
    }

    refreshTokenRepository
        .findByTokenHash(jwtService.hashToken(rawRefreshToken))
        .ifPresent(
            token -> {
              token.setRevoked(true);
              refreshTokenRepository.save(token);
            });
  }

  @Transactional
  public void revokeAll(String rawRefreshToken) {
    RefreshToken currentToken = findValidRefreshToken(rawRefreshToken);
    refreshTokenRepository
        .findByUser(currentToken.getUser())
        .forEach(
            token -> {
              token.setRevoked(true);
              refreshTokenRepository.save(token);
            });
  }

  private RefreshToken findValidRefreshToken(String rawRefreshToken) {
    if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
      throw new InvalidRefreshTokenException();
    }

    RefreshToken token =
        refreshTokenRepository
            .findByTokenHash(jwtService.hashToken(rawRefreshToken))
            .orElseThrow(InvalidRefreshTokenException::new);

    if (token.isRevoked() || token.getExpiresAt().isBefore(Instant.now())) {
      throw new InvalidRefreshTokenException();
    }

    return token;
  }
}
