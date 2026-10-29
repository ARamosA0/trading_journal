package com.portfolio.portfolio.message;

import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class MessageCatalog {

  public static final class Codes {
    public static final class Auth {
      public static final String INVALID_CREDENTIALS = "INVALID_CREDENTIALS";
      public static final String INVALID_GOOGLE_CREDENTIAL = "INVALID_GOOGLE_CREDENTIAL";
      public static final String GOOGLE_AUTH_UNAVAILABLE = "GOOGLE_AUTH_UNAVAILABLE";

      private Auth() {}
    }

    public static final class PasswordReset {
      public static final String REQUEST_ACCEPTED = "PASSWORD_RESET_REQUEST_ACCEPTED";
      public static final String RESET_SUCCESS = "PASSWORD_RESET_SUCCESS";
      public static final String INVALID_TOKEN = "INVALID_PASSWORD_RESET_TOKEN";

      private PasswordReset() {}
    }

    public static final class Registration {
      public static final String EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS";
      public static final String USERNAME_ALREADY_EXISTS = "USERNAME_ALREADY_EXISTS";
      public static final String REGISTRATION_CONFLICT = "REGISTRATION_CONFLICT";

      private Registration() {}
    }

    public static final class Validation {
      public static final String VALIDATION_ERROR = "VALIDATION_ERROR";
      public static final String WEAK_PASSWORD = "WEAK_PASSWORD";

      private Validation() {}
    }

    public static final class Session {
      public static final String SESSION_EXPIRED = "SESSION_EXPIRED";

      private Session() {}
    }

    public static final class Success {
      public static final String REGISTERED = "REGISTER_SUCCESS";
      public static final String LOGGED_IN = "LOGIN_SUCCESS";
      public static final String REFRESHED = "REFRESH_SUCCESS";
      public static final String LOGGED_OUT = "LOGOUT_SUCCESS";

      private Success() {}
    }

    private Codes() {}
  }

  public enum Type {
    ERROR,
    SUCCESS
  }

  public record Message(String code, String message, Type type) {}

  private final Map<String, Definition> messages =
      Map.ofEntries(
          entry(
              Codes.Auth.INVALID_CREDENTIALS,
              Type.ERROR,
              "El correo o la contraseña son incorrectos",
              "The email or password is incorrect"),
          entry(
              Codes.Auth.INVALID_GOOGLE_CREDENTIAL,
              Type.ERROR,
              "No se pudo verificar la cuenta de Google",
              "Google could not verify this account"),
          entry(
              Codes.Auth.GOOGLE_AUTH_UNAVAILABLE,
              Type.ERROR,
              "El inicio de sesión con Google no está configurado",
              "Google sign-in is not configured"),
          entry(
              Codes.PasswordReset.REQUEST_ACCEPTED,
              Type.SUCCESS,
              "Si el correo está registrado, recibirás instrucciones para restablecer la"
                  + " contraseña",
              "If the email is registered, you will receive password reset instructions"),
          entry(
              Codes.PasswordReset.RESET_SUCCESS,
              Type.SUCCESS,
              "La contraseña se actualizó correctamente",
              "Your password has been reset"),
          entry(
              Codes.PasswordReset.INVALID_TOKEN,
              Type.ERROR,
              "El enlace no es válido o ya expiró",
              "This password reset link is invalid or has expired"),
          entry(
              Codes.Registration.EMAIL_ALREADY_EXISTS,
              Type.ERROR,
              "El correo ya está registrado",
              "The email is already registered"),
          entry(
              Codes.Registration.USERNAME_ALREADY_EXISTS,
              Type.ERROR,
              "El nombre de usuario ya está registrado",
              "The username is already registered"),
          entry(
              Codes.Registration.REGISTRATION_CONFLICT,
              Type.ERROR,
              "El correo o nombre de usuario ya está registrado",
              "The email or username is already registered"),
          entry(
              Codes.Validation.VALIDATION_ERROR,
              Type.ERROR,
              "Todos los campos son obligatorios",
              "All fields are required"),
          entry(
              Codes.Validation.WEAK_PASSWORD,
              Type.ERROR,
              "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un"
                  + " número",
              "The password must contain at least 8 characters, an uppercase letter, a lowercase"
                  + " letter, and a number"),
          entry(
              Codes.Session.SESSION_EXPIRED,
              Type.ERROR,
              "La sesión expiró. Inicia sesión nuevamente",
              "Your session expired. Please log in again"),
          entry(
              Codes.Success.REGISTERED,
              Type.SUCCESS,
              "Cuenta creada correctamente",
              "Account created successfully"),
          entry(
              Codes.Success.LOGGED_IN,
              Type.SUCCESS,
              "Inicio de sesión correcto",
              "Login successful"),
          entry(
              Codes.Success.REFRESHED,
              Type.SUCCESS,
              "Sesión renovada correctamente",
              "Session refreshed successfully"),
          entry(
              Codes.Success.LOGGED_OUT,
              Type.SUCCESS,
              "Sesión cerrada correctamente",
              "Logout successful"));

  public Message get(String code, Locale locale) {
    Definition definition = messages.get(code);
    if (definition == null) {
      return new Message(code, code, Type.ERROR);
    }
    String text =
        locale != null && "en".equals(locale.getLanguage())
            ? definition.english()
            : definition.spanish();
    return new Message(code, text, definition.type());
  }

  private static Map.Entry<String, Definition> entry(
      String code, Type type, String spanish, String english) {
    return Map.entry(code, new Definition(type, spanish, english));
  }

  private record Definition(Type type, String spanish, String english) {}
}
