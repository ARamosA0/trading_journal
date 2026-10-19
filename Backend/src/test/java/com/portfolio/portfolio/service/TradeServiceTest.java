package com.portfolio.portfolio.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.portfolio.portfolio.dto.CloseTradeRequest;
import com.portfolio.portfolio.dto.CreateTradeRequest;
import com.portfolio.portfolio.dto.UpdateTradeRequest;
import com.portfolio.portfolio.entity.Account;
import com.portfolio.portfolio.entity.AccountState;
import com.portfolio.portfolio.entity.Trade;
import com.portfolio.portfolio.entity.TradeDirection;
import com.portfolio.portfolio.entity.TradeState;
import com.portfolio.portfolio.entity.User;
import com.portfolio.portfolio.repository.AccountRepository;
import com.portfolio.portfolio.repository.TradeRepository;
import com.portfolio.portfolio.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class TradeServiceTest {

    @Mock
    private TradeRepository tradeRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TradeService tradeService;

    private User user;
    private Account account;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id("01JUSER")
                .username("trader")
                .email("trader@example.com")
                .role("USER")
                .build();

        account = new Account();
        account.setId("01JACCOUNT");
        account.setUser(user);
        account.setName("Main account");
        account.setState(AccountState.ACTIVE);
    }

    @Test
    void createsOpenTradeAndUsesActiveAccount() {
        CreateTradeRequest request = createRequest();
        when(userRepository.findByEmailIgnoreCase("trader@example.com")).thenReturn(Optional.of(user));
        when(accountRepository.findFirstByUser_IdAndStateAndDeletedAtIsNullOrderByCreatedAtAsc(
                user.getId(), AccountState.ACTIVE)).thenReturn(Optional.of(account));
        when(tradeRepository.save(any(Trade.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = tradeService.create("trader@example.com", request);

        assertEquals("EUR/USD", response.symbol());
        assertEquals(TradeDirection.LONG, response.direction());
        assertEquals(TradeState.OPEN, response.status());
        assertEquals(account.getId(), response.accountId());
        assertEquals(new BigDecimal("1.5"), response.quantity());
        verify(tradeRepository).save(any(Trade.class));
    }

    @Test
    void createsDefaultAccountWhenUserHasNoActiveAccount() {
        CreateTradeRequest request = createRequest();
        when(userRepository.findByEmailIgnoreCase("trader@example.com")).thenReturn(Optional.of(user));
        when(accountRepository.findFirstByUser_IdAndStateAndDeletedAtIsNullOrderByCreatedAtAsc(
                user.getId(), AccountState.ACTIVE)).thenReturn(Optional.empty());
        when(accountRepository.save(any(Account.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(tradeRepository.save(any(Trade.class))).thenAnswer(invocation -> invocation.getArgument(0));

        tradeService.create("trader@example.com", request);

        verify(accountRepository).save(any(Account.class));
    }

    @Test
    void closesTradeCompletely() {
        Trade trade = openTrade(new BigDecimal("1.5"));
        whenTradeCanBeFound(trade);
        when(tradeRepository.save(any(Trade.class))).thenAnswer(invocation -> invocation.getArgument(0));
        CloseTradeRequest request = closeRequest("1.08920", "1.5", "240");

        var response = tradeService.close("trader@example.com", trade.getId(), request);

        assertEquals(TradeState.CLOSE, response.status());
        assertEquals(new BigDecimal("1.08920"), response.exitPrice());
        assertEquals(new BigDecimal("240"), response.pnl());
        assertNotNull(response.closeAt());
        assertEquals(new BigDecimal("1.5"), response.quantity());
    }

    @Test
    void partiallyClosesTradeAndMovesStopLoss() {
        Trade trade = openTrade(new BigDecimal("2.0"));
        trade.setPnl(new BigDecimal("10"));
        whenTradeCanBeFound(trade);
        when(tradeRepository.save(any(Trade.class))).thenAnswer(invocation -> invocation.getArgument(0));
        CloseTradeRequest request = closeRequest("1.09200", "0.75", "35");
        request.setMoveStopLoss(true);
        request.setStopLoss(new BigDecimal("1.09000"));

        var response = tradeService.close("trader@example.com", trade.getId(), request);

        assertEquals(TradeState.OPEN, response.status());
        assertEquals(new BigDecimal("1.25"), response.quantity());
        assertEquals(new BigDecimal("45"), response.pnl());
        assertEquals(new BigDecimal("1.09000"), response.stopLoss());
        assertNull(response.closeAt());
    }

    @Test
    void rejectsCloseQuantityGreaterThanRemainingQuantity() {
        Trade trade = openTrade(new BigDecimal("1.0"));
        whenTradeCanBeFound(trade);
        CloseTradeRequest request = closeRequest("1.09", "1.01", "0");

        assertThrows(ResponseStatusException.class,
                () -> tradeService.close("trader@example.com", trade.getId(), request));

        verify(tradeRepository, never()).save(any(Trade.class));
    }

    @Test
    void editsTradePlanWithoutChangingCloseState() {
        Trade trade = openTrade(new BigDecimal("1.0"));
        trade.setTradeState(TradeState.CLOSE);
        whenTradeCanBeFound(trade);
        when(tradeRepository.save(any(Trade.class))).thenAnswer(invocation -> invocation.getArgument(0));
        UpdateTradeRequest request = new UpdateTradeRequest();
        request.setSymbol("GBP/USD");
        request.setDirection(TradeDirection.SHORT);
        request.setEntryPrice(new BigDecimal("1.27000"));
        request.setQuantity(new BigDecimal("0.5"));
        request.setStopLoss(new BigDecimal("1.28000"));
        request.setTakeProfit(new BigDecimal("1.25000"));

        var response = tradeService.update("trader@example.com", trade.getId(), request);

        assertEquals("GBP/USD", response.symbol());
        assertEquals(TradeDirection.SHORT, response.direction());
        assertEquals(TradeState.CLOSE, response.status());
        assertEquals(new BigDecimal("0.5"), response.quantity());
    }

    @Test
    void softDeletesTradeAndKeepsPhysicalEntity() {
        Trade trade = openTrade(new BigDecimal("1.0"));
        whenTradeCanBeFound(trade);
        when(tradeRepository.save(any(Trade.class))).thenAnswer(invocation -> invocation.getArgument(0));

        tradeService.delete("trader@example.com", trade.getId());

        assertNotNull(trade.getDeletedAt());
        verify(tradeRepository).save(trade);
    }

    private CreateTradeRequest createRequest() {
        CreateTradeRequest request = new CreateTradeRequest();
        request.setSymbol("eur/usd");
        request.setDirection(TradeDirection.LONG);
        request.setEntryPrice(new BigDecimal("1.08540"));
        request.setQuantity(new BigDecimal("1.5"));
        request.setStopLoss(new BigDecimal("1.08000"));
        request.setTakeProfit(new BigDecimal("1.09500"));
        return request;
    }

    private CloseTradeRequest closeRequest(String exitPrice, String quantity, String pnl) {
        CloseTradeRequest request = new CloseTradeRequest();
        request.setExitPrice(new BigDecimal(exitPrice));
        request.setQuantity(new BigDecimal(quantity));
        request.setPnl(new BigDecimal(pnl));
        return request;
    }

    private Trade openTrade(BigDecimal quantity) {
        Trade trade = new Trade();
        trade.setId("01JTRADE");
        trade.setAccount(account);
        trade.setSymbol("EUR/USD");
        trade.setMarket("FOREX");
        trade.setDirection(TradeDirection.LONG);
        trade.setEntryPrice(new BigDecimal("1.08540"));
        trade.setQuantity(quantity);
        trade.setPnl(BigDecimal.ZERO);
        trade.setOpenAt(LocalDateTime.now().minusHours(2));
        trade.setTradeState(TradeState.OPEN);
        return trade;
    }

    private void whenTradeCanBeFound(Trade trade) {
        when(userRepository.findByEmailIgnoreCase("trader@example.com")).thenReturn(Optional.of(user));
        when(tradeRepository.findByIdAndAccount_User_IdAndDeletedAtIsNull(trade.getId(), user.getId()))
                .thenReturn(Optional.of(trade));
    }
}
