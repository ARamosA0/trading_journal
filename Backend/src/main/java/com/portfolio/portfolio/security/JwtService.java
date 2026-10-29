package com.portfolio.portfolio.security;

import com.portfolio.portfolio.dto.RefreshTokenResult;
import com.portfolio.portfolio.entity.RefreshToken;
import com.portfolio.portfolio.entity.User;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

  private static final SecureRandom SECURE_RANDOM = new SecureRandom();

  private final Key signKey;

  public JwtService(@Value("${app.jwt.secret}") String encodedSecret) {
    this.signKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(encodedSecret));
  }

  public String generateToken(User user) {

    return Jwts.builder()
        .setSubject(user.getEmail())
        .claim("role", user.getRole())
        .claim("userId", user.getId())
        .claim("userName", user.getUsername())
        .setIssuedAt(new Date())
        .setExpiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
        .signWith(signKey, SignatureAlgorithm.HS256)
        .compact();
  }

  public String hashToken(String token) {

    try {

      MessageDigest digest = MessageDigest.getInstance("SHA-256");

      byte[] hashBytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));

      StringBuilder hexString = new StringBuilder();

      for (byte b : hashBytes) {
        hexString.append(String.format("%02x", b));
      }

      return hexString.toString();

    } catch (NoSuchAlgorithmException e) {
      throw new RuntimeException(e);
    }
  }

  public RefreshTokenResult generateRefreshToken(User user) {
    return generateRefreshToken(user, false);
  }

  public RefreshTokenResult generateRefreshToken(User user, boolean rememberMe) {
    String refreshToken = generateOpaqueToken();
    String hash = hashToken(refreshToken);
    Duration lifetime = rememberMe ? Duration.ofDays(30) : Duration.ofDays(1);

    RefreshToken entity =
        RefreshToken.builder()
            .user(user)
            .tokenHash(hash)
            .expiresAt(Instant.now().plus(lifetime))
            .revoked(false)
            .rememberMe(rememberMe)
            .build();

    return new RefreshTokenResult(refreshToken, entity);
  }

  public String generateOpaqueToken() {
    byte[] bytes = new byte[64];
    SECURE_RANDOM.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  public Claims extractClaims(String token) {
    return Jwts.parserBuilder().setSigningKey(signKey).build().parseClaimsJws(token).getBody();
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
