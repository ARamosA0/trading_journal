package com.portfolio.portfolio.controller;

import com.portfolio.portfolio.dto.RegisterRequest;
import com.portfolio.portfolio.dto.LoginRequest;
import com.portfolio.portfolio.entity.User;
import com.portfolio.portfolio.dto.AuthResponse;
import com.portfolio.portfolio.service.AuthService;
// import com.portfolio.portfolio.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    // private final JwtService jwtService;

    @PostMapping("/register")
    public String register(
            @RequestBody RegisterRequest request
    ) {

        authService.register(request);

        return "User created";
    }

    @PostMapping("/login")
    public String login(
        @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.authenticate(request);
        return response.token();
    }

    
}