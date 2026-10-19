package com.portfolio.portfolio.service;

import com.github.f4b6a3.ulid.UlidCreator;
import com.portfolio.portfolio.dto.AccountResponse;
import com.portfolio.portfolio.dto.CreateAccountRequest;
import com.portfolio.portfolio.dto.UpdateAccountRequest;
import com.portfolio.portfolio.entity.Account;
import com.portfolio.portfolio.entity.AccountState;
import com.portfolio.portfolio.entity.Trade;
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
public class AccountService {
    private final AccountRepository accountRepository;
    private final TradeRepository tradeRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AccountResponse> findAll(String email) {
        User user = user(email);
        return accountRepository.findByUser_IdAndDeletedAtIsNullOrderByCreatedAtAsc(user.getId()).stream()
                .map(this::response)
                .toList();
    }

    @Transactional(readOnly = true)
    public AccountResponse findById(String email, String id) {
        return response(account(email, id));
    }

    public AccountResponse create(String email, CreateAccountRequest request) {
        validate(request);
        Account account = new Account();
        account.setId(UlidCreator.getUlid().toString());
        account.setUser(user(email));
        account.setName(request.getName().trim());
        account.setBroker(defaultText(request.getBroker(), "Manual"));
        account.setBalance(money(request.getBalance()));
        account.setCurrency(currency(request.getCurrency()));
        account.setState(request.getState() == null ? AccountState.ACTIVE : request.getState());
        return response(accountRepository.save(account));
    }

    public AccountResponse update(String email, String id, UpdateAccountRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account data is required");
        }
        Account account = account(email, id);
        if (request.getName() != null && !request.getName().isBlank()) account.setName(request.getName().trim());
        if (request.getBroker() != null && !request.getBroker().isBlank()) account.setBroker(request.getBroker().trim());
        if (request.getBalance() != null) account.setBalance(money(request.getBalance()));
        if (request.getCurrency() != null && !request.getCurrency().isBlank()) account.setCurrency(currency(request.getCurrency()));
        if (request.getState() != null) account.setState(request.getState());
        return response(accountRepository.save(account));
    }

    public void delete(String email, String id) {
        Account account = account(email, id);
        account.setDeletedAt(LocalDateTime.now());
        account.setState(AccountState.ARCHIVED);
        accountRepository.save(account);
    }

    private AccountResponse response(Account account) {
        List<Trade> trades = tradeRepository.findByAccount_IdAndDeletedAtIsNull(account.getId());
        long wins = trades.stream().filter(trade -> trade.getTradeState() != null
                && !trade.getTradeState().name().equals("OPEN")
                && trade.getPnl() != null && trade.getPnl().signum() > 0).count();
        long closed = trades.stream().filter(trade -> trade.getTradeState() != null
                && !trade.getTradeState().name().equals("OPEN")).count();
        BigDecimal winRate = closed == 0 ? BigDecimal.ZERO
                : BigDecimal.valueOf(wins * 100.0 / closed).setScale(2, RoundingMode.HALF_UP);
        BigDecimal pnl = trades.stream()
                .map(Trade::getPnl)
                .filter(value -> value != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal baseBalance = account.getBalance() == null ? BigDecimal.ZERO : account.getBalance();
        BigDecimal netBalance = baseBalance.add(pnl).setScale(2, RoundingMode.HALF_UP);
        return AccountResponse.from(account, netBalance, trades.size(), winRate);
    }

    private Account account(String email, String id) {
        return accountRepository.findByIdAndUser_IdAndDeletedAtIsNull(id, user(email).getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
    }

    private User user(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void validate(CreateAccountRequest request) {
        if (request == null || request.getName() == null || request.getName().isBlank()
                || (request.getBalance() != null && request.getBalance().signum() < 0)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account name and a valid balance are required");
        }
    }

    private BigDecimal money(BigDecimal value) {
        return value == null ? BigDecimal.ZERO.setScale(2) : value.setScale(2, RoundingMode.HALF_UP);
    }

    private String currency(String value) {
        String normalized = defaultText(value, "USD").toUpperCase();
        if (normalized.length() != 3) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Currency must have 3 letters");
        return normalized;
    }

    private String defaultText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value.trim();
    }
}
