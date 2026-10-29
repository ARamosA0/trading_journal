package com.portfolio.portfolio.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
    name = "app.auth.email.enabled",
    havingValue = "false",
    matchIfMissing = true)
public class DisabledPasswordResetNotifier implements PasswordResetNotifier {

  @Override
  public boolean isConfigured() {
    return false;
  }

  @Override
  public void sendResetLink(String email, String rawToken) {
    // Email delivery is deliberately disabled until SMTP is configured.
  }
}
