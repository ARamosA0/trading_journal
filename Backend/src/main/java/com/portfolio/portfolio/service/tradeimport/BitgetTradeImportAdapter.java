package com.portfolio.portfolio.service.tradeimport;

import com.portfolio.portfolio.entity.AccountProvider;
import com.portfolio.portfolio.entity.TradeDirection;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.stereotype.Component;

@Component
public class BitgetTradeImportAdapter implements TradeImportAdapter {
  private static final Pattern FUTURES_POSITION =
      Pattern.compile(
          "^([\\p{Alnum}_/-]+)\\s+(LONG|SHORT)(?:\\s*[·•].*)?$", Pattern.CASE_INSENSITIVE);
  private static final Set<String> REQUIRED_HEADERS =
      Set.of(
          "futures",
          "opening time",
          "average entry price",
          "average closing price",
          "closed amount",
          "closed value",
          "position pnl",
          "realized pnl",
          "fees",
          "opening fee",
          "closing fee",
          "closed time");

  @Override
  public AccountProvider provider() {
    return AccountProvider.BITGET;
  }

  @Override
  public String pnlCurrency() {
    return "USDT";
  }

  @Override
  public Set<String> requiredHeaders() {
    return REQUIRED_HEADERS;
  }

  @Override
  public TradeImportRecord parse(ImportTableRow row) {
    String futures = TradeImportValues.requiredText(row, "Futures");
    Matcher position = FUTURES_POSITION.matcher(futures);
    if (!position.matches()) {
      throw row.invalid(
          "Futures must include a symbol and Long/Short direction, for example BTCUSDT"
              + " Short·Cross");
    }

    String symbol = position.group(1).toUpperCase(Locale.ROOT);
    if (!symbol.endsWith("USDT")) {
      throw row.invalid("only USDT-settled Futures are currently supported");
    }
    TradeDirection direction = TradeDirection.valueOf(position.group(2).toUpperCase(Locale.ROOT));
    String amountUnit = symbol.substring(0, symbol.length() - "USDT".length());
    LocalDateTime openAt = TradeImportValues.requiredDateTime(row, "Opening time");
    LocalDateTime closeAt = TradeImportValues.requiredDateTime(row, "Closed time");
    if (closeAt.isBefore(openAt)) {
      throw row.invalid("Closed time must not be earlier than Opening time");
    }

    return new TradeImportRecord(
        symbol,
        direction,
        TradeImportValues.requiredPositiveDecimal(row, "Average entry price", "USDT"),
        TradeImportValues.requiredPositiveDecimal(row, "Average closing price", "USDT"),
        TradeImportValues.requiredPositiveDecimal(row, "Closed amount", amountUnit),
        null,
        null,
        TradeImportValues.requiredDecimal(row, "Realized PnL", "USDT"),
        TradeImportValues.optionalDecimal(row, "Fees", "USDT"),
        openAt,
        closeAt);
  }
}
