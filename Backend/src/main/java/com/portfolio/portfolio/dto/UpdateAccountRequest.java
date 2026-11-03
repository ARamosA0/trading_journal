package com.portfolio.portfolio.dto;

import com.portfolio.portfolio.entity.AccountProvider;
import com.portfolio.portfolio.entity.AccountState;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class UpdateAccountRequest {
  private String name;
  private String broker;
  private AccountProvider provider;
  private BigDecimal balance;
  private String currency;
  private AccountState state;
}
