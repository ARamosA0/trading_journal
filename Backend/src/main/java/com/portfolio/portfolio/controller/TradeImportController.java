package com.portfolio.portfolio.controller;

import com.portfolio.portfolio.dto.ImportTradesResponse;
import com.portfolio.portfolio.service.tradeimport.TradeImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/accounts/{accountId}/trade-imports")
@RequiredArgsConstructor
public class TradeImportController {
  private final TradeImportService tradeImportService;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ImportTradesResponse> importTrades(
      Authentication authentication,
      @PathVariable String accountId,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(
        tradeImportService.importTrades(authentication.getName(), accountId, file));
  }
}
