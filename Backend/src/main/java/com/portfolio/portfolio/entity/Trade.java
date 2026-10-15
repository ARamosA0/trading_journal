package com.portfolio.portfolio.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "trade")
@Getter
@Setter
@NoArgsConstructor
public class Trade {
    @Id
    @Column(length = 26)
    private String id;
    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;
    private String symbol;
    private String market;
    @Enumerated(EnumType.STRING)
    private TradeDirection direction;
    @Column(name = "entry_price", nullable = false, precision = 15, scale = 3)
    private BigDecimal entryPrice;
    @Column(precision = 15, scale = 3)
    private BigDecimal stopLoss;
    @Column(precision = 15, scale = 3)
    private BigDecimal takeProfit;
    @Column(name = "exit_price", precision = 15, scale = 3)
    private BigDecimal exitPrice;
    @Column(nullable = false, precision = 15, scale = 3)
    private BigDecimal quantity;
    private String riskReward;
    @Column(name = "pnl", precision = 15, scale = 3)
    private BigDecimal pnl;
    private BigDecimal commission;
    private BigDecimal swap;
    @Column(name = "open_at", nullable = false)
    private LocalDateTime openAt;
    @Column(name = "close_at")
    private LocalDateTime closeAt;
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TradeState tradeState;
    @ManyToOne
    @JoinColumn(name = "strategy")
    private Strategy strategy;
    private String notes;
    @ManyToMany
    @JoinTable(
        name = "trade_tag",
        joinColumns = @JoinColumn(name = "trade_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();
}
