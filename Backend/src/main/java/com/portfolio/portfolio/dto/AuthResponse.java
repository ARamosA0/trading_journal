package com.portfolio.portfolio.dto;

public record AuthResponse(
    String token,
    Long id,
    String email,
    String userName,
    String rol
) {}
