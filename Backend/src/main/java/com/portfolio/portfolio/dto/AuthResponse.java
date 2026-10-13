package com.portfolio.portfolio.dto;

public record AuthResponse(
    String token,
    String id,
    String email,
    String userName,
    String rol,
    String code,
    String message,
    String type
) {
    public AuthResponse(String token, String id, String email, String userName, String rol) {
        this(token, id, email, userName, rol, null, null, null);
    }
}
