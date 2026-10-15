package com.portfolio.portfolio.repository;

import com.portfolio.portfolio.entity.Account;
import com.portfolio.portfolio.entity.AccountState;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, String> {
    Optional<Account> findFirstByUser_IdAndStateAndDeletedAtIsNullOrderByCreatedAtAsc(String userId, AccountState state);
    Optional<Account> findByIdAndUser_IdAndDeletedAtIsNull(String id, String userId);
}
