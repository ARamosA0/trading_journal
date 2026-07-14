package com.portfolio.portfolio.dto;

public record AuthResponse(
    String token,
    String id,
    String email,
    String userName,
    String rol
) {}
