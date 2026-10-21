package com.portfolio.portfolio.controller;

import com.portfolio.portfolio.dto.CreatePriceAlertRequest;
import com.portfolio.portfolio.dto.PriceAlertResponse;
import com.portfolio.portfolio.dto.PriceQuoteRequest;
import com.portfolio.portfolio.dto.UpdatePriceAlertRequest;
import com.portfolio.portfolio.service.PriceAlertService;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class PriceAlertController {
    private final PriceAlertService alertService;

    @GetMapping
    public List<PriceAlertResponse> findAll(Authentication authentication) {
        return alertService.findAll(authentication.getName());
    }

    @PostMapping
    public ResponseEntity<PriceAlertResponse> create(Authentication authentication, @RequestBody CreatePriceAlertRequest request) {
        PriceAlertResponse response = alertService.create(authentication.getName(), request);
        return ResponseEntity.created(URI.create("/api/alerts/" + response.id())).body(response);
    }

    @PutMapping("/{id}")
    public PriceAlertResponse update(Authentication authentication, @PathVariable String id, @RequestBody UpdatePriceAlertRequest request) {
        return alertService.update(authentication.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable String id) {
        alertService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/quote")
    public ResponseEntity<Void> publishQuote(Authentication authentication, @RequestBody PriceQuoteRequest request) {
        alertService.publishQuote(authentication.getName(), request);
        return ResponseEntity.accepted().build();
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(Authentication authentication) {
        SseEmitter emitter = new SseEmitter(0L);
        alertService.subscribe(authentication.getName(), emitter);
        return emitter;
    }
}
