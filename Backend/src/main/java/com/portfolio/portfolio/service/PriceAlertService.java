package com.portfolio.portfolio.service;

import com.github.f4b6a3.ulid.UlidCreator;
import com.portfolio.portfolio.dto.CreatePriceAlertRequest;
import com.portfolio.portfolio.dto.PriceAlertResponse;
import com.portfolio.portfolio.dto.PriceQuoteRequest;
import com.portfolio.portfolio.dto.UpdatePriceAlertRequest;
import com.portfolio.portfolio.entity.PriceAlert;
import com.portfolio.portfolio.entity.PriceAlertDirection;
import com.portfolio.portfolio.entity.PriceAlertStatus;
import com.portfolio.portfolio.entity.User;
import com.portfolio.portfolio.repository.PriceAlertRepository;
import com.portfolio.portfolio.repository.UserRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class PriceAlertService {
    private final PriceAlertRepository alertRepository;
    private final UserRepository userRepository;
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @Transactional(readOnly = true)
    public List<PriceAlertResponse> findAll(String email) {
        return alertRepository.findByUser_IdOrderByCreatedAtDesc(user(email).getId()).stream()
                .map(PriceAlertResponse::from).toList();
    }

    public PriceAlertResponse create(String email, CreatePriceAlertRequest request) {
        validate(request == null ? null : request.getInstrument(), request == null ? null : request.getDirection(),
                request == null ? null : request.getTarget());
        PriceAlert alert = new PriceAlert();
        alert.setId(UlidCreator.getUlid().toString());
        alert.setUser(user(email));
        alert.setInstrument(request.getInstrument().trim().toUpperCase());
        alert.setDirection(request.getDirection());
        alert.setTarget(price(request.getTarget()));
        alert.setStatus(PriceAlertStatus.ACTIVE);
        alert.setCreatedAt(LocalDateTime.now());
        return PriceAlertResponse.from(alertRepository.save(alert));
    }

    public PriceAlertResponse update(String email, String id, UpdatePriceAlertRequest request) {
        validate(request == null ? null : request.getInstrument(), request == null ? null : request.getDirection(),
                request == null ? null : request.getTarget());
        PriceAlert alert = alert(email, id);
        alert.setInstrument(request.getInstrument().trim().toUpperCase());
        alert.setDirection(request.getDirection());
        alert.setTarget(price(request.getTarget()));
        if (alert.getStatus() == PriceAlertStatus.TRIGGERED) alert.setStatus(PriceAlertStatus.ACTIVE);
        return PriceAlertResponse.from(alertRepository.save(alert));
    }

    public void delete(String email, String id) {
        alertRepository.delete(alert(email, id));
    }

    public void subscribe(String email, SseEmitter emitter) {
        String userId = user(email).getId();
        emitters.computeIfAbsent(userId, ignored -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> remove(userId, emitter));
        emitter.onTimeout(() -> remove(userId, emitter));
        emitter.onError(ignored -> remove(userId, emitter));
        try {
            emitter.send(SseEmitter.event().name("connected").data(Map.of("connected", true)));
        } catch (Exception exception) {
            remove(userId, emitter);
        }
    }

    public void publishQuote(String email, PriceQuoteRequest request) {
        if (request == null || request.getInstrument() == null || request.getPrice() == null
                || request.getPrice().signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Instrument and a valid price are required");
        }
        User user = user(email);
        String instrument = request.getInstrument().trim().toUpperCase();
        BigDecimal currentPrice = price(request.getPrice());
        alertRepository.findByUser_IdAndStatus(user.getId(), PriceAlertStatus.ACTIVE).stream()
                .filter(alert -> alert.getInstrument().equalsIgnoreCase(instrument))
                .forEach(alert -> evaluate(alert, currentPrice));
    }

    private void evaluate(PriceAlert alert, BigDecimal currentPrice) {
        alert.setCurrentPrice(currentPrice);
        boolean reached = alert.getDirection() == PriceAlertDirection.ABOVE
                ? currentPrice.compareTo(alert.getTarget()) >= 0
                : currentPrice.compareTo(alert.getTarget()) <= 0;
        if (reached) {
            alert.setStatus(PriceAlertStatus.TRIGGERED);
            alert.setTriggeredAt(LocalDateTime.now());
            PriceAlertResponse response = PriceAlertResponse.from(alertRepository.save(alert));
            emit(alert.getUser().getId(), response);
        } else {
            alertRepository.save(alert);
        }
    }

    private void emit(String userId, PriceAlertResponse response) {
        List<SseEmitter> userEmitters = emitters.getOrDefault(userId, new CopyOnWriteArrayList<>());
        for (SseEmitter emitter : userEmitters) {
            try {
                emitter.send(SseEmitter.event().name("price-alert-triggered").data(response));
            } catch (Exception exception) {
                remove(userId, emitter);
            }
        }
    }

    private void remove(String userId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters != null) userEmitters.remove(emitter);
    }

    private PriceAlert alert(String email, String id) {
        return alertRepository.findByIdAndUser_Id(id, user(email).getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Price alert not found"));
    }

    private User user(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private void validate(String instrument, PriceAlertDirection direction, BigDecimal target) {
        if (instrument == null || instrument.isBlank() || direction == null || target == null || target.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Instrument, direction and target are required");
        }
    }

    private BigDecimal price(BigDecimal value) {
        return value.setScale(5, RoundingMode.HALF_UP);
    }
}
