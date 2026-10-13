package com.portfolio.portfolio.entity;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "trade")
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
    private BigDecimal entry_pryce;
    private BigDecimal exit_price;
    private BigDecimal quantity;
    private String risk_reward;
    private BigDecimal pml;
    private BigDecimal commision;
    private BigDecimal swap;
    private LocalDateTime open_at;
    private LocalDateTime close_at;
    private LocalDateTime created_at;
    private LocalDateTime deleted_at;
    @Enumerated(EnumType.STRING)
    private TradeState trade_state;
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
