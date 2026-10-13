package com.portfolio.portfolio.service;

public class InvalidRefreshTokenException extends RuntimeException {

    public InvalidRefreshTokenException() {
        super("Invalid or expired refresh token");
    }
}
