package com.portfolio.portfolio.service.tradeimport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.portfolio.portfolio.entity.Account;
import com.portfolio.portfolio.entity.AccountProvider;
import com.portfolio.portfolio.entity.AccountState;
import com.portfolio.portfolio.entity.Trade;
import com.portfolio.portfolio.entity.TradeDirection;
import com.portfolio.portfolio.entity.TradeState;
import com.portfolio.portfolio.entity.User;
import com.portfolio.portfolio.repository.AccountRepository;
import com.portfolio.portfolio.repository.TradeImportBatchRepository;
import com.portfolio.portfolio.repository.TradeRepository;
import com.portfolio.portfolio.repository.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class TradeImportServiceTest {
  @Mock private AccountRepository accountRepository;

  @Mock private TradeRepository tradeRepository;

  @Mock private TradeImportBatchRepository batchRepository;

  @Mock private UserRepository userRepository;

  @Mock private TradeImportAdapterFactory adapterFactory;

  @Mock private TradeImportFileReader fileReader;

  @InjectMocks private TradeImportService tradeImportService;

  private User user;
  private Account account;
  private MockMultipartFile file;
  private SimpleFxTradeImportAdapter adapter;

  @BeforeEach
  void setUp() {
    user =
        User.builder()
            .id("01JUSER")
            .username("trader")
            .email("trader@example.com")
            .role("USER")
            .build();
    account = new Account();
    account.setId("01JACCOUNT");
    account.setUser(user);
    account.setName("SimpleFX account");
    account.setBroker("Visible label");
    account.setProvider(AccountProvider.SIMPLEFX);
    account.setBalance(java.math.BigDecimal.ZERO);
    account.setCurrency("USD");
    account.setState(AccountState.ACTIVE);
    file = new MockMultipartFile("file", "closed.csv", "text/csv", "content".getBytes());
    adapter = new SimpleFxTradeImportAdapter();
  }

  @Test
  void persistsClosedTradesForTheOwnedProviderAccount() {
    when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
    when(accountRepository.findByIdAndUser_IdAndDeletedAtIsNull(account.getId(), user.getId()))
        .thenReturn(Optional.of(account));
    when(adapterFactory.forProvider(AccountProvider.SIMPLEFX)).thenReturn(adapter);
    when(fileReader.read(file)).thenReturn(table(simpleFxRow(2, "Buy")));
    when(tradeRepository.saveAll(anyList()))
        .thenAnswer(invocation -> {
          List<Trade> saved = invocation.getArgument(0);
          assertEquals(1, saved.size());
          assertEquals(account, saved.get(0).getAccount());
          assertEquals(TradeDirection.LONG, saved.get(0).getDirection());
          assertEquals(TradeState.CLOSE, saved.get(0).getTradeState());
          assertEquals("1.123450000", saved.get(0).getEntryPrice().toPlainString());
          assertEquals("-5.250000000", saved.get(0).getPnl().toPlainString());
          return saved;
        });

    var response = tradeImportService.importTrades(user.getEmail(), account.getId(), file);

    assertEquals(account.getId(), response.accountId());
    assertEquals(AccountProvider.SIMPLEFX, response.provider());
    assertEquals(1, response.importedCount());
    verify(tradeRepository).saveAll(anyList());
  }

  @Test
  void importsBitgetCsvWithAssetAndCurrencyUnits() {
    account.setName("Bitget account");
    account.setProvider(AccountProvider.BITGET);
    account.setCurrency("USDT");
    String csv =
        "Futures,Opening time,Average entry price,Average closing price,Closed amount,Closed"
            + " value,Position Pnl,Realized PnL,Fees,Opening fee,Closing fee,Closed time\n"
            + "BTCUSDT Short·Cross,2026-11-01"
            + " 21:06:24,78397.5,78594.6,0.0113BTC,888.11898USDT,-2.937279738USDT,-2.22723USDT,0USDT,-0.17717835USDT,-0.532871388USDT,2026-11-01"
            + " 22:24:46\n";
    file = new MockMultipartFile("file", "bitget.csv", "text/csv", csv.getBytes());
    when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
    when(accountRepository.findByIdAndUser_IdAndDeletedAtIsNull(account.getId(), user.getId()))
        .thenReturn(Optional.of(account));
    when(adapterFactory.forProvider(AccountProvider.BITGET))
        .thenReturn(new BitgetTradeImportAdapter());
    when(fileReader.read(file)).thenAnswer(invocation -> new TradeImportFileReader().read(file));
    when(tradeRepository.saveAll(anyList()))
        .thenAnswer(invocation -> {
          List<Trade> saved = invocation.getArgument(0);
          assertEquals(1, saved.size());
          assertEquals("BTCUSDT", saved.get(0).getSymbol());
          assertEquals(TradeDirection.SHORT, saved.get(0).getDirection());
          assertEquals("78397.500000000", saved.get(0).getEntryPrice().toPlainString());
          assertEquals("78594.600000000", saved.get(0).getExitPrice().toPlainString());
          assertEquals("0.011300000", saved.get(0).getQuantity().toPlainString());
          assertEquals("-2.227230000", saved.get(0).getPnl().toPlainString());
          assertEquals("0.000000000", saved.get(0).getCommission().toPlainString());
          return saved;
        });

    var response = tradeImportService.importTrades(user.getEmail(), account.getId(), file);

    assertEquals(AccountProvider.BITGET, response.provider());
    assertEquals(1, response.importedCount());
    verify(tradeRepository).saveAll(anyList());
  }

  @Test
  void abortsTheWholeFileWhenAnyRowIsInvalid() {
    when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
    when(accountRepository.findByIdAndUser_IdAndDeletedAtIsNull(account.getId(), user.getId()))
        .thenReturn(Optional.of(account));
    when(adapterFactory.forProvider(AccountProvider.SIMPLEFX)).thenReturn(adapter);
    when(fileReader.read(file))
        .thenReturn(
            new ImportTable(
                List.of(
                    "symbol",
                    "side",
                    "size",
                    "open time",
                    "close time",
                    "open price",
                    "close price",
                    "take profit",
                    "stop loss",
                    "profit (usd)"),
                List.of(simpleFxRow(2, "Buy"), simpleFxRow(3, "Unknown"))));

    ResponseStatusException exception =
        assertThrows(
            ResponseStatusException.class,
            () -> tradeImportService.importTrades(user.getEmail(), account.getId(), file));

    assertEquals(400, exception.getStatusCode().value());
    org.junit.jupiter.api.Assertions.assertTrue(exception.getReason().contains("Row 3"));
    verify(tradeRepository, never()).saveAll(anyList());
  }

  @Test
  void rejectsCurrencyMismatchBeforeParsingOrSaving() {
    account.setCurrency("USDT");
    when(userRepository.findByEmailIgnoreCase(user.getEmail())).thenReturn(Optional.of(user));
    when(accountRepository.findByIdAndUser_IdAndDeletedAtIsNull(account.getId(), user.getId()))
        .thenReturn(Optional.of(account));
    when(adapterFactory.forProvider(AccountProvider.SIMPLEFX)).thenReturn(adapter);

    assertThrows(
        ResponseStatusException.class,
        () -> tradeImportService.importTrades(user.getEmail(), account.getId(), file));

    verify(fileReader, never()).read(file);
    verify(tradeRepository, never()).saveAll(anyList());
  }

  private ImportTable table(ImportTableRow row) {
    return new ImportTable(
        List.of(
            "symbol",
            "side",
            "size",
            "open time",
            "close time",
            "open price",
            "close price",
            "take profit",
            "stop loss",
            "profit (usd)"),
        List.of(row));
  }

  private ImportTableRow simpleFxRow(int rowNumber, String side) {
    return new ImportTableRow(
        rowNumber,
        Map.of(
            "symbol", "EUR/USD",
            "side", side,
            "size", "0.5",
            "open time", "2026-10-01 10:00:00",
            "close time", "2026-10-01 11:00:00",
            "open price", "1.12345",
            "close price", "1.12500",
            "take profit", "",
            "stop loss", "",
            "profit (usd)", "-5.25"));
  }
}
