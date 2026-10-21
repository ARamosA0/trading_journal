package com.portfolio.portfolio.dto;

import com.portfolio.portfolio.entity.PriceAlert;
import com.portfolio.portfolio.entity.PriceAlertDirection;
import com.portfolio.portfolio.entity.PriceAlertStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PriceAlertResponse(
        String id,
        String instrument,
        PriceAlertDirection direction,
        BigDecimal target,
        BigDecimal currentPrice,
        PriceAlertStatus status,
        LocalDateTime triggeredAt) {
    public static PriceAlertResponse from(PriceAlert alert) {
        return new PriceAlertResponse(alert.getId(), alert.getInstrument(), alert.getDirection(), alert.getTarget(),
                alert.getCurrentPrice(), alert.getStatus(), alert.getTriggeredAt());
    }
}
