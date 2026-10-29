package com.portfolio.portfolio.service;

public interface PasswordResetNotifier {

  boolean isConfigured();

  void sendResetLink(String email, String rawToken);
}
