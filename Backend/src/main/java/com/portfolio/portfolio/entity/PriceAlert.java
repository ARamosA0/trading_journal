package com.portfolio.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "price_alert")
@Getter
@Setter
@NoArgsConstructor
public class PriceAlert {
    @Id
    @Column(length = 26)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String instrument;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PriceAlertDirection direction;

    @Column(nullable = false, precision = 15, scale = 5)
    private BigDecimal target;

    @Column(precision = 15, scale = 5)
    private BigDecimal currentPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PriceAlertStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime triggeredAt;
}
