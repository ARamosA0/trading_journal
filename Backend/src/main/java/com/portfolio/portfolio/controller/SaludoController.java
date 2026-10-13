package com.portfolio.portfolio.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;


@RestController
@RequestMapping("/check")
public class SaludoController {

    @GetMapping("/saludo")
    public String saludo() {
        return "Hola";
    }

    @GetMapping("/saludoPersonalizado/{nombre}/{edad}")
    public String saludoPersonalizado(@PathVariable String nombre, @PathVariable int edad) {
        return "Hola " + nombre + ", tienes " + edad + " años.";
    }
    
    
}

