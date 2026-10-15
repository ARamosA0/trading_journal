package com.portfolio.portfolio.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class CloseTradeRequest {
    private BigDecimal exitPrice;
    private BigDecimal quantity;
    private BigDecimal pnl;
    private Boolean moveStopLoss;
    private BigDecimal stopLoss;
}
