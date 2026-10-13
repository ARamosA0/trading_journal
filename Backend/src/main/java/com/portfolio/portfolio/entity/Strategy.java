package com.portfolio.portfolio.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "strategy")
public class Strategy {

    @Id
    @Column(length = 26)
    private String id;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;
}