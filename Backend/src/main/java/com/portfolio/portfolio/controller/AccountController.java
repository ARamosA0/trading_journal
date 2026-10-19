package com.portfolio.portfolio.controller;

import com.portfolio.portfolio.dto.AccountResponse;
import com.portfolio.portfolio.dto.CreateAccountRequest;
import com.portfolio.portfolio.dto.UpdateAccountRequest;
import com.portfolio.portfolio.service.AccountService;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;

    @GetMapping
    public List<AccountResponse> findAll(Authentication authentication) {
        return accountService.findAll(authentication.getName());
    }

    @GetMapping("/{id}")
    public AccountResponse findById(Authentication authentication, @PathVariable String id) {
        return accountService.findById(authentication.getName(), id);
    }

    @PostMapping
    public ResponseEntity<AccountResponse> create(Authentication authentication, @RequestBody CreateAccountRequest request) {
        AccountResponse response = accountService.create(authentication.getName(), request);
        return ResponseEntity.created(URI.create("/api/accounts/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public AccountResponse update(Authentication authentication, @PathVariable String id, @RequestBody UpdateAccountRequest request) {
        return accountService.update(authentication.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable String id) {
        accountService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
