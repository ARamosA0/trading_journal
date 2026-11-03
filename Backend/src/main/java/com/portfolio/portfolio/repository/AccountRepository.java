package com.portfolio.portfolio.repository;

import com.portfolio.portfolio.entity.Account;
import com.portfolio.portfolio.entity.AccountProvider;
import com.portfolio.portfolio.entity.AccountState;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AccountRepository extends JpaRepository<Account, String> {
  List<Account> findByUser_IdAndDeletedAtIsNullOrderByCreatedAtAsc(String userId);

  Optional<Account>
      findFirstByUser_IdAndStateAndDeletedAtIsNullAndProviderIsNotNullOrderByCreatedAtAsc(
          String userId, AccountState state);

  Optional<Account> findByIdAndUser_IdAndDeletedAtIsNull(String id, String userId);

  @Modifying
  @Query(
      "update Account account set account.provider = :provider "
          + "where account.provider is null and lower(trim(account.broker)) = lower(:broker)")
  int backfillProviderForBroker(
      @Param("provider") AccountProvider provider, @Param("broker") String broker);
}
