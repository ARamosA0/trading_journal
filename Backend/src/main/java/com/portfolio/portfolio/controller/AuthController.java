package com.portfolio.portfolio.controller;

import com.portfolio.portfolio.dto.RegisterRequest;
import com.portfolio.portfolio.dto.LoginRequest;
import com.portfolio.portfolio.dto.LoginResult;
import com.portfolio.portfolio.dto.AuthResponse;
import com.portfolio.portfolio.dto.ApiMessage;
import com.portfolio.portfolio.service.AuthService;
import com.portfolio.portfolio.service.InvalidRefreshTokenException;
import com.portfolio.portfolio.service.DuplicateRegistrationException;
import com.portfolio.portfolio.service.InvalidCredentialsException;
import com.portfolio.portfolio.message.MessageCatalog;
import lombok.RequiredArgsConstructor;

import java.time.Duration;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final MessageCatalog messageCatalog;

    @Value("${app.auth.cookie-secure:false}")
    private boolean secureCookie;

    @PostMapping("/register")
    public AuthResponse register(
            @RequestBody RegisterRequest request,
            Locale locale
    ) {
        return withMessage(authService.registerAndReturnResponse(request), MessageCatalog.Codes.Success.REGISTERED, locale);
    }

    @ExceptionHandler(DuplicateRegistrationException.class)
    public ResponseEntity<ApiMessage> handleDuplicateRegistration(DuplicateRegistrationException exception, Locale locale) {
        HttpStatus status = exception.getCode().equals(MessageCatalog.Codes.Validation.VALIDATION_ERROR)
                || exception.getCode().equals(MessageCatalog.Codes.Validation.WEAK_PASSWORD)
                ? HttpStatus.BAD_REQUEST
                : HttpStatus.CONFLICT;
        return ResponseEntity.status(status).body(message(exception.getCode(), locale));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiMessage> handleRegistrationConstraintViolation(Locale locale) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(message(MessageCatalog.Codes.Registration.REGISTRATION_CONFLICT, locale));
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiMessage> handleInvalidCredentials(Locale locale) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(message(MessageCatalog.Codes.Auth.INVALID_CREDENTIALS, locale));
    }

    // @PostMapping("/login")
    // public AuthResponse login(
    //     @RequestBody LoginRequest request
    // ) {
    //     System.out.println("LOGIN");
    //     return authService.authenticate(request);
    // }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @RequestBody LoginRequest request, Locale locale) {

        LoginResult result = authService.authenticate(request);

        return ResponseEntity.ok()
                .header("Set-Cookie", refreshCookie(result.refreshToken()).toString())
                .body(withMessage(result.authResponse(), MessageCatalog.Codes.Success.LOGGED_IN, locale));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken, Locale locale) {
        try {
            LoginResult result = authService.refresh(refreshToken);
            return ResponseEntity.ok()
                    .header("Set-Cookie", refreshCookie(result.refreshToken()).toString())
                    .body(withMessage(result.authResponse(), MessageCatalog.Codes.Success.REFRESHED, locale));
        } catch (InvalidRefreshTokenException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(message(MessageCatalog.Codes.Session.SESSION_EXPIRED, locale));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiMessage> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken, Locale locale) {
        authService.logout(refreshToken);
        return ResponseEntity.ok()
                .header("Set-Cookie", clearRefreshCookie().toString())
                .body(message(MessageCatalog.Codes.Success.LOGGED_OUT, locale));
    }

    @PostMapping("/revoke")
    public ResponseEntity<Void> revoke(
            @CookieValue(value = "refreshToken", required = false) String refreshToken) {
        try {
            authService.revokeAll(refreshToken);
        } catch (InvalidRefreshTokenException exception) {
            // Revocation is idempotent: do not disclose whether a token exists.
        }
        return ResponseEntity.noContent()
                .header("Set-Cookie", clearRefreshCookie().toString())
                .build();
    }

    private ResponseCookie refreshCookie(String value) {
        return ResponseCookie.from("refreshToken", value)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Strict")
                .path("/auth")
                .maxAge(Duration.ofDays(7))
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite("Strict")
                .path("/auth")
                .maxAge(Duration.ZERO)
                .build();
    }

    private AuthResponse withMessage(AuthResponse response, String code, Locale locale) {
        MessageCatalog.Message resolved = messageCatalog.get(code, locale);
        return new AuthResponse(response.token(), response.id(), response.email(), response.userName(), response.rol(),
                resolved.code(), resolved.message(), resolved.type().name());
    }

    private ApiMessage message(String code, Locale locale) {
        MessageCatalog.Message resolved = messageCatalog.get(code, locale);
        return new ApiMessage(resolved.code(), resolved.message(), resolved.type().name());
    }
}
