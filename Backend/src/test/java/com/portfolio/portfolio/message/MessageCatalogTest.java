package com.portfolio.portfolio.message;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Locale;
import org.junit.jupiter.api.Test;

class MessageCatalogTest {

  private final MessageCatalog catalog = new MessageCatalog();

  @Test
  void resolvesSpanishErrorMessage() {
    MessageCatalog.Message message =
        catalog.get(MessageCatalog.Codes.Auth.INVALID_CREDENTIALS, Locale.forLanguageTag("es"));

    assertEquals("INVALID_CREDENTIALS", message.code());
    assertEquals("El correo o la contraseña son incorrectos", message.message());
    assertEquals(MessageCatalog.Type.ERROR, message.type());
  }

  @Test
  void resolvesEnglishSuccessMessage() {
    MessageCatalog.Message message =
        catalog.get(MessageCatalog.Codes.Success.LOGGED_IN, Locale.ENGLISH);

    assertEquals("Login successful", message.message());
    assertEquals(MessageCatalog.Type.SUCCESS, message.type());
  }

  @Test
  void resolvesGenericPasswordResetMessageInEnglish() {
    MessageCatalog.Message message =
        catalog.get(MessageCatalog.Codes.PasswordReset.REQUEST_ACCEPTED, Locale.ENGLISH);

    assertEquals("PASSWORD_RESET_REQUEST_ACCEPTED", message.code());
    assertEquals(
        "If the email is registered, you will receive password reset instructions",
        message.message());
    assertEquals(MessageCatalog.Type.SUCCESS, message.type());
  }

  @Test
  void fallsBackToSpanishForUnsupportedLanguage() {
    MessageCatalog.Message message =
        catalog.get(MessageCatalog.Codes.Success.LOGGED_OUT, Locale.FRENCH);

    assertEquals("Sesión cerrada correctamente", message.message());
  }

  @Test
  void returnsCodeWhenMessageIsNotRegistered() {
    MessageCatalog.Message message = catalog.get("UNKNOWN_CODE", Locale.ENGLISH);

    assertEquals("UNKNOWN_CODE", message.message());
    assertEquals(MessageCatalog.Type.ERROR, message.type());
  }
}
