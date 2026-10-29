package com.portfolio.portfolio.entity;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "refresh_tokens")
@Getter
@Setter
@NoArgsConstructor
@Builder
public class RefreshToken {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "token_hash", nullable = false, unique = true, length = 64)
  private String tokenHash;

  @Column(name = "expires_at", nullable = false)
  private Instant expiresAt;

  @Column(name = "created_at", nullable = false, updatable = false)
  private Instant createdAt;

  @Column(nullable = false)
  private boolean revoked;

  @Column(name = "remember_me", nullable = false, columnDefinition = "boolean default false")
  private boolean rememberMe;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  public RefreshToken(
      Long id,
      String tokenHash,
      Instant expiresAt,
      Instant createdAt,
      boolean revoked,
      boolean rememberMe,
      User user) {
    this.id = id;
    this.tokenHash = tokenHash;
    this.expiresAt = expiresAt;
    this.createdAt = createdAt;
    this.revoked = revoked;
    this.rememberMe = rememberMe;
    this.user = user;
  }

  public RefreshToken(
      Long id, String tokenHash, Instant expiresAt, Instant createdAt, boolean revoked, User user) {
    this(id, tokenHash, expiresAt, createdAt, revoked, false, user);
  }

  @PrePersist
  public void prePersist() {
    createdAt = Instant.now();
  }
}
