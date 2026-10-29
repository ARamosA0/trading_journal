package com.portfolio.portfolio.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.portfolio.portfolio.entity.User;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

  private static final String TEST_SECRET =
      Base64.getEncoder().encodeToString("12345678901234567890123456789012".getBytes());
  private final JwtService jwtService = new JwtService(TEST_SECRET);

  @Test
  void generatedTokenContainsUserClaims() {
    User user =
        User.builder()
            .id("01JUSER")
            .email("trader@example.com")
            .username("trader")
            .role("USER")
            .build();

    String token = jwtService.generateToken(user);

    assertEquals("trader@example.com", jwtService.extractEmail(token));
    assertEquals("USER", jwtService.extractRole(token));
    assertEquals("trader", jwtService.extractUserName(token));
    assertEquals("01JUSER", jwtService.extractUserId(token));
  }

  @Test
  void hashesSameTokenDeterministically() {
    String first = jwtService.hashToken("refresh-token");
    String second = jwtService.hashToken("refresh-token");

    assertEquals(first, second);
    assertEquals(64, first.length());
    assertNotEquals(first, jwtService.hashToken("different-token"));
  }

  @Test
  void generatesUnrevokedRefreshTokenWithFutureExpiration() {
    User user = User.builder().email("trader@example.com").build();

    var result = jwtService.generateRefreshToken(user);

    assertNotNull(result.refreshToken());
    assertNotNull(result.entity().getTokenHash());
    assertEquals(user, result.entity().getUser());
    assertTrue(result.entity().getExpiresAt().isAfter(Instant.now()));
    assertTrue(!result.entity().isRevoked());
    assertTrue(!result.entity().isRememberMe());
    assertTrue(Duration.between(Instant.now(), result.entity().getExpiresAt()).toHours() <= 24);
  }

  @Test
  void rememberMeRefreshTokenHasThirtyDayLifetime() {
    User user = User.builder().email("trader@example.com").build();

    var result = jwtService.generateRefreshToken(user, true);

    assertTrue(result.entity().isRememberMe());
    assertTrue(Duration.between(Instant.now(), result.entity().getExpiresAt()).toDays() >= 29);
    assertTrue(Duration.between(Instant.now(), result.entity().getExpiresAt()).toDays() <= 30);
  }

  @Test
  void generatesHighEntropyOpaqueToken() {
    String token = jwtService.generateOpaqueToken();

    assertEquals(86, token.length());
    assertNotEquals(token, jwtService.generateOpaqueToken());
  }
}
