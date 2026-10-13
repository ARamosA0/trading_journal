package com.portfolio.portfolio.security;

import com.portfolio.portfolio.entity.User;
import com.portfolio.portfolio.entity.RefreshToken;
import com.portfolio.portfolio.dto.RefreshTokenResult;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Date;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

@Service
public class JwtService {

    // private final AuthController authController;
    private final String SECRET =
            "mysupersecretkeymysupersecretkey";

    // JwtService(AuthController authController) {
    //     this.authController = authController;
    // }

    private Key getSignKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(User user) {

        return Jwts.builder()
                .setSubject(user.getEmail())
                .claim("role", user.getRole())
                .claim("userId", user.getId())
                .claim("userName", user.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(
                        new Date(System.currentTimeMillis() + 1000 * 60 * 60)
                )
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String hashToken(String token) {

        try {

            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hashBytes =
                    digest.digest(
                            token.getBytes(StandardCharsets.UTF_8)
                    );

            StringBuilder hexString =
                    new StringBuilder();

            for (byte b : hashBytes) {
                hexString.append(
                        String.format("%02x", b)
                );
            }

            return hexString.toString();

        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    public RefreshTokenResult generateRefreshToken(User user) {

    SecureRandom secureRandom = new SecureRandom();

    byte[] bytes = new byte[64];

    secureRandom.nextBytes(bytes);

    String refreshToken =
            Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(bytes);

    String hash = hashToken(refreshToken);

    RefreshToken entity = RefreshToken.builder()
            .user(user)
            .tokenHash(hash)
            .expiresAt(
                    Instant.now()
                            .plus(7, ChronoUnit.DAYS)
            )
            .revoked(false)
            .build();

    return new RefreshTokenResult(
            refreshToken,
            entity
    );
}


    public Claims extractClaims (String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractEmail(String token) {

        return extractClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return extractClaims(token).get("role", String.class);
    }

    public String extractUserName(String token) {
        return extractClaims(token).get("userName", String.class);

    }

    public String extractUserId(String token) {
        return extractClaims(token).get("userId", String.class);
    }
}
