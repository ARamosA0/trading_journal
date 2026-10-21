package com.portfolio.portfolio.dto;

import java.math.BigDecimal;
import lombok.Data;

@Data
public class PriceQuoteRequest {
    private String instrument;
    private BigDecimal price;
}
