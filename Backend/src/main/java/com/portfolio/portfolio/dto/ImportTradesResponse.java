package com.portfolio.portfolio.dto;

import com.portfolio.portfolio.entity.AccountProvider;
import java.time.LocalDateTime;

public record ImportTradesResponse(
    String accountId,
    AccountProvider provider,
    int importedCount,
    boolean skipped,
    LocalDateTime importedAt) {}
