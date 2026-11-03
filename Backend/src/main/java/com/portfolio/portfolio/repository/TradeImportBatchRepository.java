package com.portfolio.portfolio.repository;

import com.portfolio.portfolio.entity.TradeImportBatch;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TradeImportBatchRepository extends JpaRepository<TradeImportBatch, String> {
  Optional<TradeImportBatch> findByAccount_IdAndFileHash(String accountId, String fileHash);
}
