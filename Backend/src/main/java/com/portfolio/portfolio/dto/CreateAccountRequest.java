package com.portfolio.portfolio.dto;

import com.portfolio.portfolio.entity.AccountState;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class CreateAccountRequest {
    private String name;
    private String broker;
    private BigDecimal balance;
    private String currency;
    private AccountState state;
}
