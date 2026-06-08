package com.portfolio.portfolio.service;

import com.portfolio.portfolio.entity.*;
import com.portfolio.portfolio.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import com.portfolio.portfolio.dto.RegisterRequest;
import com.portfolio.portfolio.dto.LoginRequest;
import com.portfolio.portfolio.dto.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.portfolio.portfolio.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public void register(RegisterRequest request) {

        User user = new User();

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