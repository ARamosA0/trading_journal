package com.portfolio.portfolio.repository;

import com.portfolio.portfolio.entity.Trade;
import com.portfolio.portfolio.entity.TradeState;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TradeRepository extends JpaRepository<Trade, String> {
    List<Trade> findByAccount_User_IdAndDeletedAtIsNullOrderByOpenAtDesc(String userId);
    List<Trade> findByAccount_User_IdAndTradeStateAndDeletedAtIsNullOrderByOpenAtDesc(String userId, TradeState state);
    Optional<Trade> findByIdAndAccount_User_IdAndDeletedAtIsNull(String id, String userId);
}
