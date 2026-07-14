package com.portfolio.portfolio.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.github.f4b6a3.ulid.UlidCreator;
import com.portfolio.portfolio.dto.AuthResponse;
import com.portfolio.portfolio.dto.LoginRequest;
import com.portfolio.portfolio.dto.RegisterRequest;
import com.portfolio.portfolio.entity.User;
import com.portfolio.portfolio.repository.UserRepository;
import com.portfolio.portfolio.security.JwtService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public void register(RegisterRequest request) {

        User user = new User();

        user.setId(UlidCreator.getUlid().toString());
        user.setUsername(request.getUserName());

        user.setEmail(request.getEmail());

        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole("USER");

        userRepository.save(user);
    }

    public AuthResponse authenticate(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getUsername(), user.getRole());
    }

}