package com.portfolio.portfolio.repository;

import com.portfolio.portfolio.entity.PriceAlert;
import com.portfolio.portfolio.entity.PriceAlertStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceAlertRepository extends JpaRepository<PriceAlert, String> {
    List<PriceAlert> findByUser_IdOrderByCreatedAtDesc(String userId);
    Optional<PriceAlert> findByIdAndUser_Id(String id, String userId);
    List<PriceAlert> findByUser_IdAndStatus(String userId, PriceAlertStatus status);
}
