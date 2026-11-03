package com.portfolio.portfolio.service;

import static org.mockito.Mockito.verify;

import com.portfolio.portfolio.entity.AccountProvider;
import com.portfolio.portfolio.repository.AccountRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;

@ExtendWith(MockitoExtension.class)
class AccountProviderBackfillTest {

  @Mock private AccountRepository accountRepository;

  @InjectMocks private AccountProviderBackfill backfill;

  @Test
  void assignsProviderIdentitiesForKnownBrokerLabels() throws Exception {
    backfill.run(new DefaultApplicationArguments(new String[0]));

    verify(accountRepository).backfillProviderForBroker(AccountProvider.SIMPLEFX, "SimpleFX");
    verify(accountRepository).backfillProviderForBroker(AccountProvider.BITGET, "Bitget");
  }
}
