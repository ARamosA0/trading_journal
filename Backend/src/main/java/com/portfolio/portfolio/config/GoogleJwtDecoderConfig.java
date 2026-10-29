package com.portfolio.portfolio.config;

import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

@Configuration
public class GoogleJwtDecoderConfig {

  private static final String GOOGLE_JWK_SET_URI = "https://www.googleapis.com/oauth2/v3/certs";

  @Bean("googleJwtDecoder")
  public JwtDecoder googleJwtDecoder(@Value("${app.auth.google.client-id:}") String clientId) {
    NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(GOOGLE_JWK_SET_URI).build();

    OAuth2TokenValidator<Jwt> issuerValidator =
        jwt -> {
          String issuer = jwt.getIssuer() == null ? "" : jwt.getIssuer().toString();
          return List.of("https://accounts.google.com", "accounts.google.com").contains(issuer)
              ? OAuth2TokenValidatorResult.success()
              : OAuth2TokenValidatorResult.failure(
                  new OAuth2Error("invalid_token", "Invalid Google issuer", null));
        };
    OAuth2TokenValidator<Jwt> audienceValidator =
        jwt ->
            !clientId.isBlank()
                    && jwt.getAudience().contains(clientId)
                    && (jwt.getAudience().size() == 1
                        || clientId.equals(jwt.getClaimAsString("azp")))
                ? OAuth2TokenValidatorResult.success()
                : OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Invalid Google audience", null));

    decoder.setJwtValidator(
        new DelegatingOAuth2TokenValidator<>(
            JwtValidators.createDefault(), issuerValidator, audienceValidator));
    return decoder;
  }
}
