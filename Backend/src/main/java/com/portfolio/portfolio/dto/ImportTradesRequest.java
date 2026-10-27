package com.portfolio.portfolio.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Data;

@Data
public class ImportTradesRequest {
    private String accountId;
    private List<ImportedTrade> trades;

    @Data
    public static class ImportedTrade {
        private String symbol;
        private String side;
        private BigDecimal size;
        private LocalDateTime openAt;
        private LocalDateTime closeAt;
        private BigDecimal openPrice;
        private BigDecimal closePrice;
        private BigDecimal takeProfit;
        private BigDecimal stopLoss;
        private BigDecimal profitUsd;
    }
}
