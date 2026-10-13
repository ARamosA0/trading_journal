package com.portfolio.portfolio.dto;

public record LoginResult(
    AuthResponse authResponse,
    String refreshToken
) {}
