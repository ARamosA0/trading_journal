package com.portfolio.portfolio.service;

import com.github.f4b6a3.ulid.UlidCreator;
import com.portfolio.portfolio.dto.CloseTradeRequest;
import com.portfolio.portfolio.dto.CreateTradeRequest;
import com.portfolio.portfolio.dto.TradeResponse;
import com.portfolio.portfolio.dto.UpdateTradeRequest;
import com.portfolio.portfolio.entity.Account;
import com.portfolio.portfolio.entity.AccountState;
import com.portfolio.portfolio.entity.Trade;
import com.portfolio.portfolio.entity.TradeState;
import com.portfolio.portfolio.entity.User;
import com.portfolio.portfolio.repository.AccountRepository;
import com.portfolio.portfolio.repository.TradeRepository;
import com.portfolio.portfolio.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class TradeService {
    private final TradeRepository tradeRepository;
    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<TradeResponse> findAll(String email) {
        return tradeRepository.findByAccount_User_IdAndDeletedAtIsNullOrderByOpenAtDesc(user(email).getId())
                .stream().map(TradeResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<TradeResponse> findOpen(String email) {
        return tradeRepository.findByAccount_User_IdAndTradeStateAndDeletedAtIsNullOrderByOpenAtDesc(
                        user(email).getId(), TradeState.OPEN)
                .stream().map(TradeResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public TradeResponse findById(String email, String id) {
        return TradeResponse.from(trade(email, id));
    }

    public TradeResponse create(String email, CreateTradeRequest request) {
        validateCreate(request);
        User user = user(email);
        Account account = accountFor(user, request.getAccountId());
        LocalDateTime now = LocalDateTime.now();

        Trade trade = new Trade();
        trade.setId(UlidCreator.getUlid().toString());
        trade.setAccount(account);
        trade.setSymbol(request.getSymbol().trim().toUpperCase());
        trade.setMarket(defaultText(request.getMarket(), "OTHER"));
        trade.setDirection(request.getDirection());
        trade.setEntryPrice(price(request.getEntryPrice()));
        trade.setStopLoss(price(request.getStopLoss()));
        trade.setTakeProfit(price(request.getTakeProfit()));
        trade.setQuantity(request.getQuantity());
        trade.setNotes(defaultText(request.getNotes(), ""));
        trade.setOpenAt(now);
        trade.setCreatedAt(now);
        trade.setTradeState(TradeState.OPEN);
        trade.setPnl(BigDecimal.ZERO);

        return TradeResponse.from(tradeRepository.save(trade));
    }

    public TradeResponse update(String email, String id, UpdateTradeRequest request) {
        Trade trade = trade(email, id);
        if (request.getSymbol() != null && !request.getSymbol().isBlank()) trade.setSymbol(request.getSymbol().trim().toUpperCase());
        if (request.getMarket() != null && !request.getMarket().isBlank()) trade.setMarket(request.getMarket().trim());
        if (request.getDirection() != null) trade.setDirection(request.getDirection());
        if (request.getEntryPrice() != null) trade.setEntryPrice(price(request.getEntryPrice()));
        if (request.getStopLoss() != null) trade.setStopLoss(price(request.getStopLoss()));
        if (request.getTakeProfit() != null) trade.setTakeProfit(price(request.getTakeProfit()));
        if (request.getQuantity() != null) trade.setQuantity(request.getQuantity());
        if (request.getNotes() != null) trade.setNotes(request.getNotes());
        return TradeResponse.from(tradeRepository.save(trade));
    }

    public TradeResponse close(String email, String id, CloseTradeRequest request) {
        Trade trade = trade(email, id);
        if (request == null || request.getExitPrice() == null || request.getQuantity() == null
                || request.getQuantity().signum() <= 0 || request.getQuantity().compareTo(trade.getQuantity()) > 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Exit price and a valid close quantity are required");
        }
        if (trade.getTradeState() != TradeState.OPEN) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Trade is already closed");
        }
        trade.setExitPrice(price(request.getExitPrice()));
        BigDecimal currentPnl = trade.getPnl() == null ? BigDecimal.ZERO : trade.getPnl();
        trade.setPnl(currentPnl.add(request.getPnl() == null ? BigDecimal.ZERO : request.getPnl()));
        if (Boolean.TRUE.equals(request.getMoveStopLoss())) {
            if (request.getStopLoss() == null || request.getStopLoss().signum() < 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A valid stop loss is required when moving it");
            }
            trade.setStopLoss(price(request.getStopLoss()));
        }
        if (request.getQuantity().compareTo(trade.getQuantity()) < 0) {
            trade.setQuantity(trade.getQuantity().subtract(request.getQuantity()));
        } else {
            trade.setCloseAt(LocalDateTime.now());
            trade.setTradeState(TradeState.CLOSE);
        }
        return TradeResponse.from(tradeRepository.save(trade));
    }

    public void delete(String email, String id) {
        Trade trade = trade(email, id);
        trade.setDeletedAt(LocalDateTime.now());
        tradeRepository.save(trade);
    }

    private Trade trade(String email, String id) {
        return tradeRepository.findByIdAndAccount_User_IdAndDeletedAtIsNull(id, user(email).getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Trade not found"));
    }

    private User user(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private Account accountFor(User user, String accountId) {
        if (accountId != null && !accountId.isBlank()) {
            return accountRepository.findByIdAndUser_IdAndDeletedAtIsNull(accountId, user.getId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        }
        return accountRepository.findFirstByUser_IdAndStateAndDeletedAtIsNullOrderByCreatedAtAsc(user.getId(), AccountState.ACTIVE)
                .orElseGet(() -> createDefaultAccount(user));
    }

    private Account createDefaultAccount(User user) {
        Account account = new Account();
        account.setId(UlidCreator.getUlid().toString());
        account.setUser(user);
        account.setName("Main account");
        account.setBroker("Manual");
        account.setBalance(BigDecimal.ZERO);
        account.setCurrency("USD");
        account.setState(AccountState.ACTIVE);
        return accountRepository.save(account);
    }

    private void validateCreate(CreateTradeRequest request) {
        if (request == null || request.getSymbol() == null || request.getSymbol().isBlank()
                || request.getDirection() == null || request.getEntryPrice() == null
                || request.getEntryPrice().signum() < 0 || request.getQuantity() == null
                || request.getQuantity().signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Symbol, direction, entry price and quantity are required");
        }
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }

    private BigDecimal price(BigDecimal value) {
        return value == null ? null : value.setScale(5, RoundingMode.HALF_UP);
    }
}
