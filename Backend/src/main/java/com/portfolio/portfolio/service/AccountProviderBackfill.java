package com.portfolio.portfolio.service;

import com.portfolio.portfolio.entity.AccountProvider;
import com.portfolio.portfolio.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AccountProviderBackfill implements ApplicationRunner {
  private final AccountRepository accountRepository;

  @Override
  @Transactional
  public void run(ApplicationArguments args) {
    accountRepository.backfillProviderForBroker(AccountProvider.SIMPLEFX, "SimpleFX");
    accountRepository.backfillProviderForBroker(AccountProvider.BITGET, "Bitget");
  }
}
