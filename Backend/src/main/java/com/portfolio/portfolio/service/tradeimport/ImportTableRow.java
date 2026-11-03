package com.portfolio.portfolio.service.tradeimport;

import java.util.Map;

public record ImportTableRow(int rowNumber, Map<String, String> values) {
  public String value(String header) {
    return values.get(TradeImportFileReader.normalizeHeader(header));
  }

  public TradeImportRowException invalid(String message) {
    return new TradeImportRowException(rowNumber, message);
  }
}
