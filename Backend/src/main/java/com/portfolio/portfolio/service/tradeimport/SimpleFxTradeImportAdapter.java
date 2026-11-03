package com.portfolio.portfolio.service.tradeimport;

import com.portfolio.portfolio.entity.AccountProvider;
import java.time.LocalDateTime;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class SimpleFxTradeImportAdapter implements TradeImportAdapter {
  private static final Set<String> REQUIRED_HEADERS =
      Set.of(
          "symbol",
          "side",
          "size",
          "open time",
          "close time",
          "open price",
          "close price",
          "profit (usd)");

  @Override
  public AccountProvider provider() {
    return AccountProvider.SIMPLEFX;
  }

  @Override
  public String pnlCurrency() {
    return "USD";
  }

  @Override
  public Set<String> requiredHeaders() {
    return REQUIRED_HEADERS;
  }

  @Override
  public TradeImportRecord parse(ImportTableRow row) {
    String symbol = TradeImportValues.requiredText(row, "Symbol").toUpperCase();
    LocalDateTime openAt = TradeImportValues.requiredDateTime(row, "Open Time");
    LocalDateTime closeAt = TradeImportValues.requiredDateTime(row, "Close Time");
    if (closeAt.isBefore(openAt)) {
      throw row.invalid("Close Time must not be earlier than Open Time");
    }
    return new TradeImportRecord(
        symbol,
        TradeImportValues.simpleFxDirection(row, "Side"),
        TradeImportValues.requiredPositiveDecimal(row, "Open Price"),
        TradeImportValues.requiredPositiveDecimal(row, "Close price"),
        TradeImportValues.requiredPositiveDecimal(row, "Size"),
        TradeImportValues.optionalDecimal(row, "Stop Loss"),
        TradeImportValues.optionalDecimal(row, "Take Profit"),
        TradeImportValues.requiredDecimal(row, "Profit (USD)"),
        null,
        openAt,
        closeAt);
  }
}
