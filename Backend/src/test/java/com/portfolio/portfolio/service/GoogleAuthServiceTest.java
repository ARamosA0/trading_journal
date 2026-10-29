package com.portfolio.portfolio.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.portfolio.portfolio.dto.AuthResponse;
import com.portfolio.portfolio.dto.LoginResult;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

class GoogleAuthServiceTest {

  private final JwtDecoder jwtDecoder = mock(JwtDecoder.class);
  private final AuthService authService = mock(AuthService.class);
  private final GoogleAuthService googleAuthService =
      new GoogleAuthService(jwtDecoder, authService, "configured-google-client-id");

  @Test
  void validatesGoogleIdentityTokenAndCreatesApplicationSession() {
    Jwt identityToken = identityToken(true);
    LoginResult expected =
        new LoginResult(
            new AuthResponse("access", "user-id", "trader@example.com", "Trader", "USER"),
            "refresh",
            true);
    when(jwtDecoder.decode("signed-id-token")).thenReturn(identityToken);
    when(authService.authenticateGoogle("google-subject", "trader@example.com", "Trader", true))
        .thenReturn(expected);

    LoginResult actual = googleAuthService.authenticate("signed-id-token", true);

    assertEquals(expected, actual);
    verify(authService).authenticateGoogle("google-subject", "trader@example.com", "Trader", true);
  }

  @Test
  void rejectsGoogleIdentityWithoutVerifiedEmail() {
    when(jwtDecoder.decode("signed-id-token")).thenReturn(identityToken(false));

    assertThrows(
        InvalidGoogleCredentialException.class,
        () -> googleAuthService.authenticate("signed-id-token", false));
  }

  private Jwt identityToken(boolean emailVerified) {
    return Jwt.withTokenValue("signed-id-token")
        .header("alg", "RS256")
        .issuer("https://accounts.google.com")
        .subject("google-subject")
        .audience(List.of("configured-google-client-id"))
        .claim("email", "trader@example.com")
        .claim("email_verified", emailVerified)
        .claim("name", "Trader")
        .issuedAt(Instant.now().minusSeconds(5))
        .expiresAt(Instant.now().plusSeconds(60))
        .build();
  }
}
