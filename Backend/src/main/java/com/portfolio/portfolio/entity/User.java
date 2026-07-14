package com.portfolio.portfolio.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(length = 26)
    private String id;

    @Column(unique = true, nullable = false)
    private String username;

    private String email;

    private String password;

    private String role;
}