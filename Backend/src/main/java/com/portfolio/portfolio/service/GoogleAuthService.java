package com.portfolio.portfolio.service;

import com.portfolio.portfolio.dto.LoginResult;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

@Service
public class GoogleAuthService {

  private final JwtDecoder googleJwtDecoder;
  private final AuthService authService;
  private final String clientId;

  public GoogleAuthService(
      @Qualifier("googleJwtDecoder") JwtDecoder googleJwtDecoder,
      AuthService authService,
      @Value("${app.auth.google.client-id:}") String clientId) {
    this.googleJwtDecoder = googleJwtDecoder;
    this.authService = authService;
    this.clientId = clientId;
  }

  public LoginResult authenticate(String credential, boolean rememberMe) {
    if (clientId.isBlank()) {
      throw new GoogleAuthenticationUnavailableException();
    }
    if (credential == null || credential.isBlank()) {
      throw new InvalidGoogleCredentialException();
    }

    Jwt identityToken;
    try {
      identityToken = googleJwtDecoder.decode(credential);
    } catch (JwtException | IllegalArgumentException exception) {
      throw new InvalidGoogleCredentialException();
    }

    String subject = identityToken.getSubject();
    String email = identityToken.getClaimAsString("email");
    String name = identityToken.getClaimAsString("name");
    Boolean emailVerified = identityToken.getClaimAsBoolean("email_verified");
    if (subject == null
        || subject.isBlank()
        || email == null
        || email.isBlank()
        || !Boolean.TRUE.equals(emailVerified)) {
      throw new InvalidGoogleCredentialException();
    }

    return authService.authenticateGoogle(subject, email, name, rememberMe);
  }
}
