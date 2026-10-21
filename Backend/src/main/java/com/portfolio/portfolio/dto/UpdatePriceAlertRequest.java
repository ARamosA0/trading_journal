package com.portfolio.portfolio.dto;

import com.portfolio.portfolio.entity.PriceAlertDirection;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class UpdatePriceAlertRequest {
    private String instrument;
    private PriceAlertDirection direction;
    private BigDecimal target;
}
