package com.portfolio.portfolio.service;

import com.portfolio.portfolio.entity.*;
import com.portfolio.portfolio.repository.UserRepository;

import lombok.RequiredArgsConstructor;

import com.portfolio.portfolio.dto.RegisterRequest;
import com.portfolio.portfolio.dto.LoginRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

    public void authenticate(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        
        }
    }

    public void login(LoginRequest request) {
        // Implement login logic here (e.g., authenticate user, generate JWT token, etc.)
    }
}