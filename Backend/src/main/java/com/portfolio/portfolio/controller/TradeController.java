package com.portfolio.portfolio.controller;

import com.portfolio.portfolio.dto.CloseTradeRequest;
import com.portfolio.portfolio.dto.CreateTradeRequest;
import com.portfolio.portfolio.dto.ImportTradesRequest;
import com.portfolio.portfolio.dto.ImportTradesResponse;
import com.portfolio.portfolio.dto.TradeResponse;
import com.portfolio.portfolio.dto.UpdateTradeRequest;
import com.portfolio.portfolio.service.TradeService;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trades")
@RequiredArgsConstructor
public class TradeController {
    private final TradeService tradeService;

    @GetMapping
    public List<TradeResponse> findAll(Authentication authentication) {
        return tradeService.findAll(authentication.getName());
    }

    @GetMapping("/open")
    public List<TradeResponse> findOpen(Authentication authentication) {
        return tradeService.findOpen(authentication.getName());
    }

    @GetMapping("/{id}")
    public TradeResponse findById(Authentication authentication, @PathVariable String id) {
        return tradeService.findById(authentication.getName(), id);
    }

    @PostMapping
    public ResponseEntity<TradeResponse> create(Authentication authentication, @RequestBody CreateTradeRequest request) {
        TradeResponse response = tradeService.create(authentication.getName(), request);
        return ResponseEntity.created(URI.create("/api/trades/" + response.id())).body(response);
    }

    @PostMapping("/import")
    public ImportTradesResponse importTrades(Authentication authentication, @RequestBody ImportTradesRequest request) {
        return tradeService.importTrades(authentication.getName(), request);
    }

    @PutMapping("/{id}")
    public TradeResponse update(Authentication authentication, @PathVariable String id, @RequestBody UpdateTradeRequest request) {
        return tradeService.update(authentication.getName(), id, request);
    }

    @PatchMapping("/{id}/close")
    public TradeResponse close(Authentication authentication, @PathVariable String id, @RequestBody CloseTradeRequest request) {
        return tradeService.close(authentication.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable String id) {
        tradeService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
