package com.portfolio.portfolio.dto;

import com.portfolio.portfolio.entity.Account;
import com.portfolio.portfolio.entity.AccountProvider;
import com.portfolio.portfolio.entity.AccountState;
import java.math.BigDecimal;

public record AccountResponse(
    String id,
    String name,
    String broker,
    AccountProvider provider,
    BigDecimal balance,
    BigDecimal netBalance,
    String currency,
    AccountState state,
    long trades,
    BigDecimal winRate) {

  public static AccountResponse from(
      Account account, BigDecimal netBalance, long trades, BigDecimal winRate) {
    return new AccountResponse(
        account.getId(),
        account.getName(),
        account.getBroker(),
        account.getProvider(),
        account.getBalance(),
        netBalance,
        account.getCurrency(),
        account.getState(),
        trades,
        winRate);
  }
}
