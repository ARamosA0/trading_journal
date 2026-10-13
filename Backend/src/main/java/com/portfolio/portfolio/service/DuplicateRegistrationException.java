package com.portfolio.portfolio.service;

public class DuplicateRegistrationException extends RuntimeException {

    private final String code;

    public DuplicateRegistrationException(String code) {
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
