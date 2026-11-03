package com.portfolio.portfolio.service.tradeimport;

import com.portfolio.portfolio.entity.TradeDirection;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TradeImportRecord(
    String symbol,
    TradeDirection direction,
    BigDecimal entryPrice,
    BigDecimal exitPrice,
    BigDecimal quantity,
    BigDecimal stopLoss,
    BigDecimal takeProfit,
    BigDecimal pnl,
    BigDecimal commission,
    LocalDateTime openAt,
    LocalDateTime closeAt) {}
