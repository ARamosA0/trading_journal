package com.portfolio.portfolio.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {@UniqueConstraint(name = "uk_users_email", columnNames = "email")})
@Getter
@Setter
@NoArgsConstructor
@Builder
public class User {

  @Id
  @Column(length = 26)
  private String id;

  @Column(unique = true, nullable = false)
  private String username;

  @Column(nullable = false)
  private String email;

  @Column(nullable = false)
  private String password;

  private String role;

  @Column(name = "google_subject", unique = true, length = 255)
  private String googleSubject;

  public User(
      String id,
      String username,
      String email,
      String password,
      String role,
      String googleSubject) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
    this.googleSubject = googleSubject;
  }

  public User(String id, String username, String email, String password, String role) {
    this(id, username, email, password, role, null);
  }
}
