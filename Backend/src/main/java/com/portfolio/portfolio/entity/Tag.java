package com.portfolio.portfolio.entity;
import jakarta.persistence.*;
import lombok.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tag")
public class Tag {

    @Id
    @Column(length = 26)
    private String id;

    private String name;

    private String color;

    @ManyToMany(mappedBy = "tags")
    private Set<Trade> trades = new HashSet<>();
}