package com.portfolio.portfolio.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.portfolio.portfolio.dto.CreateAccountRequest;
import com.portfolio.portfolio.dto.UpdateAccountRequest;
import com.portfolio.portfolio.entity.Account;
import com.portfolio.portfolio.entity.AccountProvider;
import com.portfolio.portfolio.entity.AccountState;
import com.portfolio.portfolio.entity.User;
import com.portfolio.portfolio.repository.AccountRepository;
import com.portfolio.portfolio.repository.TradeRepository;
import com.portfolio.portfolio.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class AccountServiceTest {

  @Mock private AccountRepository accountRepository;

  @Mock private TradeRepository tradeRepository;

  @Mock private UserRepository userRepository;

  @InjectMocks private AccountService accountService;

  private User user;
  private Account legacyAccount;

  @BeforeEach
  void setUp() {
    user =
        User.builder()
            .id("01JUSER")
            .username("trader")
            .email("trader@example.com")
            .role("USER")
            .build();

    legacyAccount = new Account();
    legacyAccount.setId("01JACCOUNT");
    legacyAccount.setUser(user);
    legacyAccount.setName("Imported account");
    legacyAccount.setBroker("Legacy broker label");
    legacyAccount.setBalance(new BigDecimal("100.00"));
    legacyAccount.setCurrency("USD");
    legacyAccount.setState(AccountState.ACTIVE);
  }

  @Test
  void createsAccountWithProviderAndDefaultsVisibleLabel() {
    CreateAccountRequest request = new CreateAccountRequest();
    request.setName("Main account");
    request.setProvider(AccountProvider.SIMPLEFX);
    request.setCurrency("USD");
    when(userRepository.findByEmailIgnoreCase("trader@example.com")).thenReturn(Optional.of(user));
    when(accountRepository.save(any(Account.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(tradeRepository.findByAccount_IdAndDeletedAtIsNull(any())).thenReturn(List.of());

    var response = accountService.create("trader@example.com", request);

    assertEquals(AccountProvider.SIMPLEFX, response.provider());
    assertEquals("SimpleFX", response.broker());
  }

  @Test
  void requiresProviderWhenCreatingAccount() {
    CreateAccountRequest request = new CreateAccountRequest();
    request.setName("Main account");

    assertThrows(
        ResponseStatusException.class, () -> accountService.create("trader@example.com", request));
  }

  @Test
  void acceptsUsdtAsAccountCurrency() {
    CreateAccountRequest request = new CreateAccountRequest();
    request.setName("Bitget account");
    request.setProvider(AccountProvider.BITGET);
    request.setCurrency("USDT");
    when(userRepository.findByEmailIgnoreCase("trader@example.com")).thenReturn(Optional.of(user));
    when(accountRepository.save(any(Account.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(tradeRepository.findByAccount_IdAndDeletedAtIsNull(any())).thenReturn(List.of());

    var response = accountService.create("trader@example.com", request);

    assertEquals("USDT", response.currency());
  }

  @Test
  void assignsProviderToLegacyAccountWithoutChangingItsIdOrDisplayLabel() {
    UpdateAccountRequest request = new UpdateAccountRequest();
    request.setProvider(AccountProvider.BITGET);
    when(userRepository.findByEmailIgnoreCase("trader@example.com")).thenReturn(Optional.of(user));
    when(accountRepository.findByIdAndUser_IdAndDeletedAtIsNull(
            legacyAccount.getId(), user.getId()))
        .thenReturn(Optional.of(legacyAccount));
    when(accountRepository.save(any(Account.class)))
        .thenAnswer(invocation -> invocation.getArgument(0));
    when(tradeRepository.findByAccount_IdAndDeletedAtIsNull(legacyAccount.getId()))
        .thenReturn(List.of());

    var response = accountService.update("trader@example.com", legacyAccount.getId(), request);

    assertEquals("01JACCOUNT", response.id());
    assertEquals("Legacy broker label", response.broker());
    assertEquals(AccountProvider.BITGET, response.provider());
  }
}
