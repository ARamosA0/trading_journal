package com.portfolio.portfolio.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trade_img")
public class TradeImage {

    @Id
    @Column(length = 26)
    private String id;

    @ManyToOne
    @JoinColumn(name = "trade_id")
    private Trade trade;

    private String url;
}
