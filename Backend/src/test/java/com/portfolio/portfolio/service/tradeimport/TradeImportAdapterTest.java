package com.portfolio.portfolio.service.tradeimport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.portfolio.portfolio.entity.AccountProvider;
import com.portfolio.portfolio.entity.TradeDirection;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class TradeImportAdapterTest {
  private final SimpleFxTradeImportAdapter simpleFxAdapter = new SimpleFxTradeImportAdapter();
  private final BitgetTradeImportAdapter bitgetAdapter = new BitgetTradeImportAdapter();

  @Test
  void mapsClosedSimpleFxTradeFields() {
    ImportTableRow row =
        new ImportTableRow(
            2,
            Map.of(
                "symbol", "eur/usd",
                "side", "sell",
                "size", "1.25",
                "open time", "31.10.2026 10:00:00.123",
                "close time", "31.10.2026 11:00:00.123",
                "open price", "1.123456789",
                "close price", "1.11111",
                "take profit", "",
                "stop loss", "1.10000",
                "profit (usd)", "-15.125"));

    TradeImportRecord record = simpleFxAdapter.parse(row);

    assertEquals("EUR/USD", record.symbol());
    assertEquals(TradeDirection.SHORT, record.direction());
    assertEquals("1.123456789", record.entryPrice().toPlainString());
    assertEquals("-15.125", record.pnl().toPlainString());
    assertNull(record.takeProfit());
    assertEquals(LocalDateTime.of(2026, 10, 31, 10, 0, 0, 123_000_000), record.openAt());
  }

  @Test
  void mapsBitgetDirectionAndRealizedPnlFromPositionHistory() {
    ImportTableRow row =
        new ImportTableRow(
            2,
            Map.ofEntries(
                Map.entry("futures", "BTCUSDT Short·Cross"),
                Map.entry("opening time", "10/30/2026 12:52:22 PM"),
                Map.entry("average entry price", "60000.123456789"),
                Map.entry("average closing price", "59000.25"),
                Map.entry("closed amount", "2.99796"),
                Map.entry("closed value", "176879.84"),
                Map.entry("position pnl", "2998.54"),
                Map.entry("realized pnl", "2.869595064"),
                Map.entry("fees", "-0.128364936"),
                Map.entry("opening fee", "-0.064182468"),
                Map.entry("closing fee", "-0.064182468"),
                Map.entry("closed time", "10/30/2026 1:52:22 PM")));

    TradeImportRecord record = bitgetAdapter.parse(row);

    assertEquals("BTCUSDT", record.symbol());
    assertEquals(TradeDirection.SHORT, record.direction());
    assertEquals("2.99796", record.quantity().toPlainString());
    assertEquals("2.869595064", record.pnl().toPlainString());
    assertEquals("-0.128364936", record.commission().toPlainString());
    assertEquals(LocalDateTime.of(2026, 10, 30, 12, 52, 22), record.openAt());
  }

  @Test
  void factorySelectsTheAdapterAndHeaderSchemaForEachProvider() {
    TradeImportAdapterFactory factory =
        new TradeImportAdapterFactory(List.of(simpleFxAdapter, bitgetAdapter));

    assertEquals(simpleFxAdapter, factory.forProvider(AccountProvider.SIMPLEFX));
    assertEquals(bitgetAdapter, factory.forProvider(AccountProvider.BITGET));
    assertTrue(
        simpleFxAdapter
            .requiredHeaders()
            .containsAll(List.of("symbol", "open time", "close time", "profit (usd)")));
    assertTrue(
        bitgetAdapter
            .requiredHeaders()
            .containsAll(
                List.of("futures", "opening time", "closed time", "realized pnl", "fees")));
  }

  @Test
  void rejectsBitgetRowsWithoutDirectionInFuturesField() {
    ImportTableRow row = new ImportTableRow(4, Map.of("futures", "BTCUSDT·Cross"));

    TradeImportRowException exception =
        assertThrows(TradeImportRowException.class, () -> bitgetAdapter.parse(row));

    assertEquals(
        "Row 4: Futures must include a symbol and Long/Short direction, for example BTCUSDT"
            + " Short·Cross",
        exception.getMessage());
  }
}
