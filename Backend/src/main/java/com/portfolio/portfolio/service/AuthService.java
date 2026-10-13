package com.portfolio.portfolio.service;

import java.time.Instant;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.github.f4b6a3.ulid.UlidCreator;
import com.portfolio.portfolio.dto.AuthResponse;
import com.portfolio.portfolio.dto.LoginRequest;
import com.portfolio.portfolio.dto.LoginResult;
import com.portfolio.portfolio.dto.RefreshTokenResult;
import com.portfolio.portfolio.dto.RegisterRequest;
import com.portfolio.portfolio.entity.User;
import com.portfolio.portfolio.repository.RefreshTokenRepository;
import com.portfolio.portfolio.repository.UserRepository;
import com.portfolio.portfolio.security.JwtService;
import com.portfolio.portfolio.message.MessageCatalog;

import com.portfolio.portfolio.entity.RefreshToken;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public AuthResponse registerAndReturnResponse(RegisterRequest request) {
        validateRegistration(request);
        String email = request.getEmail().trim().toLowerCase(java.util.Locale.ROOT);

        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new DuplicateRegistrationException(MessageCatalog.Codes.Registration.EMAIL_ALREADY_EXISTS);
        }

        if (userRepository.findByUsername(request.getUserName()).isPresent()) {
            throw new DuplicateRegistrationException(MessageCatalog.Codes.Registration.USERNAME_ALREADY_EXISTS);
        }

        User user = new User();

        user.setId(UlidCreator.getUlid().toString());
        user.setUsername(request.getUserName());

        user.setEmail(email);

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole("USER");

        userRepository.save(user);

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getUsername(), user.getRole());
    }

    // public AuthResponse authenticate(LoginRequest request) {
    //     User user = userRepository.findByEmail(request.getEmail())
    //         .orElseThrow(() -> new RuntimeException("User not found"));

    //     if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
    //         throw new RuntimeException("Invalid password");

    //     }

    //     String token = jwtService.generateToken(user);

    //     RefreshTokenResult result = jwtService.generateRefreshToken(user);

    //     refreshTokenRepository.save(result.entity());
    //     String refreshToken = result.refreshToken();

    //     return new AuthResponse(token, user.getId(), user.getEmail(), user.getUsername(), user.getRole());
    // }

    public LoginResult authenticate(LoginRequest request) {

        if (request == null || request.getEmail() == null || request.getPassword() == null
                || request.getEmail().isBlank() || request.getPassword().isBlank()) {
            throw new InvalidCredentialsException();
        }

        User user = userRepository.findByEmailIgnoreCase(request.getEmail().trim())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        String accessToken = jwtService.generateToken(user);

        RefreshTokenResult result = jwtService.generateRefreshToken(user);

        refreshTokenRepository.save(result.entity());

        AuthResponse response = new AuthResponse(
                accessToken,
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getRole()
        );

        return new LoginResult(response, result.refreshToken());
    }

    private void validateRegistration(RegisterRequest request) {
        if (request == null
                || request.getUserName() == null || request.getUserName().isBlank()
                || request.getEmail() == null || request.getEmail().isBlank()
                || request.getPassword() == null || request.getPassword().isBlank()) {
            throw new DuplicateRegistrationException(MessageCatalog.Codes.Validation.VALIDATION_ERROR);
        }

        String password = request.getPassword();
        if (password.length() < 8
                || !password.matches(".*[A-Z].*")
                || !password.matches(".*[a-z].*")
                || !password.matches(".*[0-9].*")) {
            throw new DuplicateRegistrationException(MessageCatalog.Codes.Validation.WEAK_PASSWORD);
        }
    }

    @Transactional
    public LoginResult refresh(String rawRefreshToken) {
        RefreshToken currentToken = findValidRefreshToken(rawRefreshToken);
        currentToken.setRevoked(true);
        refreshTokenRepository.save(currentToken);

        User user = currentToken.getUser();
        RefreshTokenResult replacement = jwtService.generateRefreshToken(user);
        refreshTokenRepository.save(replacement.entity());

        AuthResponse response = new AuthResponse(
                jwtService.generateToken(user),
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getRole()
        );

        return new LoginResult(response, replacement.refreshToken());
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }

        refreshTokenRepository.findByTokenHash(jwtService.hashToken(rawRefreshToken))
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    @Transactional
    public void revokeAll(String rawRefreshToken) {
        RefreshToken currentToken = findValidRefreshToken(rawRefreshToken);
        refreshTokenRepository.findByUser(currentToken.getUser()).forEach(token -> {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
        });
    }

    private RefreshToken findValidRefreshToken(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new InvalidRefreshTokenException();
        }

        RefreshToken token = refreshTokenRepository
                .findByTokenHash(jwtService.hashToken(rawRefreshToken))
                .orElseThrow(InvalidRefreshTokenException::new);

        if (token.isRevoked() || token.getExpiresAt().isBefore(Instant.now())) {
            throw new InvalidRefreshTokenException();
        }

        return token;
    }

}
