package com.portfolio.portfolio.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "account")
@Getter
@Setter
@NoArgsConstructor
public class Account {

  @Id
  @Column(length = 26)
  private String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  private String name;

  private String broker;

  @Enumerated(EnumType.STRING)
  @Column(length = 32)
  private AccountProvider provider;

  @Column(precision = 15, scale = 2)
  private BigDecimal balance;

  @Column(length = 4)
  private String currency;

  @CreationTimestamp private LocalDateTime createdAt;

  @Enumerated(EnumType.STRING)
  private AccountState state;

  private LocalDateTime deletedAt;
}
