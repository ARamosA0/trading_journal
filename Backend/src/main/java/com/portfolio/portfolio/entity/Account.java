package com.portfolio.portfolio.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


@Entity
@Table(name = "account")
public class Account {

    @Id
    @Column(length = 26)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String name;

    private String broker;

    @Column(precision = 15, scale = 2)
    private BigDecimal balance;

    @Column(length = 3)
    private String currency;

    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private AccountState state;

    private LocalDateTime deletedAt;
}