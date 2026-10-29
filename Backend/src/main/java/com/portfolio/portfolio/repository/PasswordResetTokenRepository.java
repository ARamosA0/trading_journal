package com.portfolio.portfolio.repository;

import com.portfolio.portfolio.entity.PasswordResetToken;
import com.portfolio.portfolio.entity.User;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  Optional<PasswordResetToken> findByTokenHash(String tokenHash);

  @Modifying
  @Query(
      "update PasswordResetToken token set token.used = true where token.user = :user and"
          + " token.used = false")
  void invalidateUnusedByUser(@Param("user") User user);
}
