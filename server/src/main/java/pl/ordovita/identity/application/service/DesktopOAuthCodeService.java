package pl.ordovita.identity.application.service;

import org.springframework.stereotype.Service;
import pl.ordovita.identity.application.port.in.LoginUseCase;
import pl.ordovita.identity.domain.exception.TokenException;
import pl.ordovita.identity.domain.model.token.TokenPair;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DesktopOAuthCodeService {

    private static final Duration CODE_TTL = Duration.ofMinutes(2);
    private static final int CODE_BYTES = 32;

    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, DesktopOAuthPayload> codes = new ConcurrentHashMap<>();

    public String create(TokenPair tokenPair, LoginUseCase.UserInfo userInfo) {
        cleanupExpiredCodes();

        byte[] randomBytes = new byte[CODE_BYTES];
        secureRandom.nextBytes(randomBytes);
        String code = Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);

        codes.put(code, new DesktopOAuthPayload(
                tokenPair,
                userInfo,
                Instant.now().plus(CODE_TTL)
        ));

        return code;
    }

    public DesktopOAuthPayload consume(String code) {
        if (code == null || code.isBlank()) {
            throw new TokenException("Desktop OAuth code is required");
        }

        DesktopOAuthPayload payload = codes.remove(code);

        if (payload == null) {
            throw new TokenException("Invalid desktop OAuth code");
        }

        if (payload.expiresAt().isBefore(Instant.now())) {
            throw new TokenException("Desktop OAuth code has expired");
        }

        return payload;
    }

    private void cleanupExpiredCodes() {
        Instant now = Instant.now();
        codes.entrySet().removeIf(entry -> entry.getValue().expiresAt().isBefore(now));
    }

    public record DesktopOAuthPayload(
            TokenPair tokenPair,
            LoginUseCase.UserInfo userInfo,
            Instant expiresAt
    ) {
    }
}
