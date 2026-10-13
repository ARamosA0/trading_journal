package com.portfolio.portfolio.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api")
public class UsuarioController {
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("usuarios")
    public String getUsuarios(@RequestParam String param) {
        return new String();
    }
    
}
