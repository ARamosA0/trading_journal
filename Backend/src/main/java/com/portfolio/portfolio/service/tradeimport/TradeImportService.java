package com.portfolio.portfolio.service.tradeimport;

import com.github.f4b6a3.ulid.UlidCreator;
import com.portfolio.portfolio.dto.ImportTradesResponse;
import com.portfolio.portfolio.entity.Account;
import com.portfolio.portfolio.entity.Trade;
import com.portfolio.portfolio.entity.TradeImportBatch;
import com.portfolio.portfolio.entity.TradeState;
import com.portfolio.portfolio.entity.User;
import com.portfolio.portfolio.repository.AccountRepository;
import com.portfolio.portfolio.repository.TradeImportBatchRepository;
import com.portfolio.portfolio.repository.TradeRepository;
import com.portfolio.portfolio.repository.UserRepository;
import java.io.IOException;
import java.math.RoundingMode;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class TradeImportService {
  private static final int MAX_REPORTED_ROW_ERRORS = 20;

  private final AccountRepository accountRepository;
  private final TradeRepository tradeRepository;
  private final TradeImportBatchRepository batchRepository;
  private final UserRepository userRepository;
  private final TradeImportAdapterFactory adapterFactory;
  private final TradeImportFileReader fileReader;

  public ImportTradesResponse importTrades(String email, String accountId, MultipartFile file) {
    User user =
        userRepository
            .findByEmailIgnoreCase(email)
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    Account account =
        accountRepository
            .findByIdAndUser_IdAndDeletedAtIsNull(accountId, user.getId())
            .orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
    if (account.getProvider() == null) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "Assign SimpleFX or Bitget to this account before importing trades");
    }

    TradeImportAdapter adapter = adapterFactory.forProvider(account.getProvider());
    if (account.getCurrency() == null
        || !adapter.pnlCurrency().equalsIgnoreCase(account.getCurrency())) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "This provider's P&L is in "
              + adapter.pnlCurrency()
              + "; set the account currency to "
              + adapter.pnlCurrency()
              + " before importing");
    }

    String fileHash = sha256(file);
    Optional<TradeImportBatch> previous =
        batchRepository.findByAccount_IdAndFileHash(account.getId(), fileHash);
    if (previous.isPresent()) {
      TradeImportBatch batch = previous.get();
      return new ImportTradesResponse(
          account.getId(),
          batch.getProvider(),
          batch.getImportedCount(),
          true,
          batch.getCreatedAt());
    }

    ImportTable table = fileReader.read(file);
    validateHeaders(adapter, table.headers());
    if (table.rows().isEmpty()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The file contains no trade rows");
    }

    List<TradeImportRecord> records = new ArrayList<>(table.rows().size());
    List<String> errors = new ArrayList<>();
    for (ImportTableRow row : table.rows()) {
      try {
        records.add(adapter.parse(row));
      } catch (TradeImportRowException exception) {
        errors.add(exception.getMessage());
      }
    }
    if (!errors.isEmpty()) {
      throw importValidationFailure(errors);
    }

    LocalDateTime importedAt = LocalDateTime.now();
    List<Trade> trades =
        records.stream().map(record -> toTrade(account, record, importedAt)).toList();
    registerImport(account, file, fileHash, trades.size(), importedAt);
    tradeRepository.saveAll(trades);
    return new ImportTradesResponse(
        account.getId(), account.getProvider(), trades.size(), false, importedAt);
  }

  private void validateHeaders(TradeImportAdapter adapter, List<String> headers) {
    Set<String> missing = new TreeSet<>(adapter.requiredHeaders());
    missing.removeAll(headers);
    if (!missing.isEmpty()) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST,
          "The file does not match the "
              + adapter.provider()
              + " export; missing columns: "
              + String.join(", ", missing));
    }
  }

  private ResponseStatusException importValidationFailure(List<String> errors) {
    List<String> shown = errors.stream().limit(MAX_REPORTED_ROW_ERRORS).toList();
    String message = "Import aborted; no trades were saved. " + String.join("; ", shown);
    if (errors.size() > shown.size()) {
      message += "; and " + (errors.size() - shown.size()) + " more row errors";
    }
    return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
  }

  private void registerImport(
      Account account,
      MultipartFile file,
      String fileHash,
      int importedCount,
      LocalDateTime importedAt) {
    TradeImportBatch batch = new TradeImportBatch();
    batch.setId(UlidCreator.getUlid().toString());
    batch.setAccount(account);
    batch.setFileHash(fileHash);
    batch.setFileName(file.getOriginalFilename());
    batch.setProvider(account.getProvider());
    batch.setImportedCount(importedCount);
    batch.setCreatedAt(importedAt);
    try {
      batchRepository.saveAndFlush(batch);
    } catch (DataIntegrityViolationException exception) {
      throw new ResponseStatusException(
          HttpStatus.CONFLICT,
          "This file was already imported into "
              + account.getName()
              + ". Nothing was imported again.");
    }
  }

  private String sha256(MultipartFile file) {
    try {
      MessageDigest digest = MessageDigest.getInstance("SHA-256");
      return HexFormat.of().formatHex(digest.digest(file.getBytes()));
    } catch (NoSuchAlgorithmException exception) {
      throw new ResponseStatusException(
          HttpStatus.INTERNAL_SERVER_ERROR, "SHA-256 is not available on this server");
    } catch (IOException exception) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "The uploaded file could not be read");
    }
  }

  private Trade toTrade(Account account, TradeImportRecord record, LocalDateTime importedAt) {
    Trade trade = new Trade();
    trade.setId(UlidCreator.getUlid().toString());
    trade.setAccount(account);
    trade.setSymbol(record.symbol());
    trade.setMarket("OTHER");
    trade.setDirection(record.direction());
    trade.setEntryPrice(record.entryPrice().setScale(9, RoundingMode.HALF_UP));
    trade.setExitPrice(record.exitPrice().setScale(9, RoundingMode.HALF_UP));
    trade.setQuantity(record.quantity().setScale(9, RoundingMode.HALF_UP));
    trade.setStopLoss(scale(record.stopLoss()));
    trade.setTakeProfit(scale(record.takeProfit()));
    trade.setPnl(record.pnl().setScale(9, RoundingMode.HALF_UP));
    trade.setCommission(scale(record.commission()));
    trade.setOpenAt(record.openAt());
    trade.setCloseAt(record.closeAt());
    trade.setCreatedAt(importedAt);
    trade.setTradeState(TradeState.CLOSE);
    trade.setNotes("Imported from " + account.getProvider().displayName());
    return trade;
  }

  private java.math.BigDecimal scale(java.math.BigDecimal value) {
    return value == null ? null : value.setScale(9, RoundingMode.HALF_UP);
  }
}
