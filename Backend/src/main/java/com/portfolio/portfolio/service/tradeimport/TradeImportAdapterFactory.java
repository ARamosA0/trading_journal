package com.portfolio.portfolio.service.tradeimport;

import com.portfolio.portfolio.entity.AccountProvider;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class TradeImportAdapterFactory {
  private final Map<AccountProvider, TradeImportAdapter> adapters;

  public TradeImportAdapterFactory(List<TradeImportAdapter> adapters) {
    Map<AccountProvider, TradeImportAdapter> registered = new EnumMap<>(AccountProvider.class);
    for (TradeImportAdapter adapter : adapters) {
      if (registered.put(adapter.provider(), adapter) != null) {
        throw new IllegalStateException(
            "Multiple trade import adapters registered for " + adapter.provider());
      }
    }
    this.adapters = Map.copyOf(registered);
  }

  public TradeImportAdapter forProvider(AccountProvider provider) {
    TradeImportAdapter adapter = adapters.get(provider);
    if (adapter == null) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "Trade import is not supported for this provider");
    }
    return adapter;
  }
}
