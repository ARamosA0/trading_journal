package com.portfolio.portfolio.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.auth.email.enabled", havingValue = "true")
public class SmtpPasswordResetNotifier implements PasswordResetNotifier {

  private final JavaMailSender mailSender;

  @Value("${app.auth.password-reset-url}")
  private String resetPasswordUrl;

  @Value("${app.auth.email.from}")
  private String fromAddress;

  @Override
  public boolean isConfigured() {
    return true;
  }

  @Override
  public void sendResetLink(String email, String rawToken) {
    String resetLink =
        UriComponentsBuilder.fromUriString(resetPasswordUrl)
            .fragment("token=" + rawToken)
            .build()
            .toUriString();

    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(fromAddress);
    message.setTo(email);
    message.setSubject("Reset your TradeVault password");
    message.setText(
        "Use this one-time link to reset your password. It expires in 15 minutes:\n\n"
            + resetLink
            + "\n\nIf you did not request this, you can ignore this email.");
    mailSender.send(message);
  }
}
