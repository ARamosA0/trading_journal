package com.portfolio.portfolio.service.tradeimport;

import com.portfolio.portfolio.entity.AccountProvider;
import java.util.Set;

public interface TradeImportAdapter {
  AccountProvider provider();

  String pnlCurrency();

  Set<String> requiredHeaders();

  TradeImportRecord parse(ImportTableRow row);
}
