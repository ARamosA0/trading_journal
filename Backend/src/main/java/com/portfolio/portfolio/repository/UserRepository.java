package com.portfolio.portfolio.repository;

import com.portfolio.portfolio.entity.User;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, String> {
  Optional<User> findByUsername(String username);

  Optional<User> findByEmailIgnoreCase(String email);

  Optional<User> findByGoogleSubject(String googleSubject);

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select account from User account where lower(account.email) = lower(:email)")
  Optional<User> findByEmailIgnoreCaseForUpdate(@Param("email") String email);
}
