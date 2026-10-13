package com.portfolio.portfolio.security;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Instant;

import org.junit.jupiter.api.Test;

import com.portfolio.portfolio.entity.User;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService();

    @Test
    void generatedTokenContainsUserClaims() {
        User user = User.builder()
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
    }
}
