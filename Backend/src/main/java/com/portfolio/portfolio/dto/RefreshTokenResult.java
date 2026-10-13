package com.portfolio.portfolio.dto;
import com.portfolio.portfolio.entity.RefreshToken;

public record RefreshTokenResult(
        String refreshToken,
        RefreshToken entity
) {}