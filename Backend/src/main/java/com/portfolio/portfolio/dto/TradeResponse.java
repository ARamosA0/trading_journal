package com.portfolio.portfolio.dto;

import com.portfolio.portfolio.entity.Trade;
import com.portfolio.portfolio.entity.TradeDirection;
import com.portfolio.portfolio.entity.TradeState;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TradeResponse(
        String id,
        String accountId,
        String accountName,
        String symbol,
        String market,
        TradeDirection direction,
        BigDecimal entryPrice,
        BigDecimal stopLoss,
        BigDecimal takeProfit,
        BigDecimal exitPrice,
        BigDecimal quantity,
        BigDecimal pnl,
        LocalDateTime openAt,
        LocalDateTime closeAt,
        TradeState status,
        String notes) {

    public static TradeResponse from(Trade trade) {
        return new TradeResponse(
                trade.getId(),
                trade.getAccount().getId(),
                trade.getAccount().getName(),
                trade.getSymbol(),
                trade.getMarket(),
                trade.getDirection(),
                trade.getEntryPrice(),
                trade.getStopLoss(),
                trade.getTakeProfit(),
                trade.getExitPrice(),
                trade.getQuantity(),
                trade.getPnl(),
                trade.getOpenAt(),
                trade.getCloseAt(),
                trade.getTradeState(),
                trade.getNotes());
    }
}
