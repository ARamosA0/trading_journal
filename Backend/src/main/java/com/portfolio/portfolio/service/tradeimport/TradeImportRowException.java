package com.portfolio.portfolio.service.tradeimport;

public class TradeImportRowException extends RuntimeException {
  public TradeImportRowException(int rowNumber, String message) {
    super("Row " + rowNumber + ": " + message);
  }
}
