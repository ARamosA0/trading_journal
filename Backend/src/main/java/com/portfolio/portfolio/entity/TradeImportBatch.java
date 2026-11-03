package com.portfolio.portfolio.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "trade_import_batch",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_trade_import_batch_account_hash",
            columnNames = {"account_id", "file_hash"}))
@Getter
@Setter
@NoArgsConstructor
public class TradeImportBatch {

  @Id
  @Column(length = 26)
  private String id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "account_id", nullable = false)
  private Account account;

  @Column(name = "file_hash", length = 64, nullable = false)
  private String fileHash;

  @Column(name = "file_name")
  private String fileName;

  @Enumerated(EnumType.STRING)
  @Column(length = 32, nullable = false)
  private AccountProvider provider;

  @Column(name = "imported_count", nullable = false)
  private int importedCount;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;
}
