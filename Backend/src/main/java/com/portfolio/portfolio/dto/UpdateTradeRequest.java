package com.portfolio.portfolio.dto;

import com.portfolio.portfolio.entity.TradeDirection;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class UpdateTradeRequest {
    private String symbol;
    private String market;
    private TradeDirection direction;
    private BigDecimal entryPrice;
    private BigDecimal stopLoss;
    private BigDecimal takeProfit;
    private BigDecimal quantity;
    private String notes;
}
