package pl.ordovita.identity.application.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import pl.ordovita.identity.application.port.in.SessionManagerUseCase;
import pl.ordovita.identity.application.port.out.TokenGenerator;
import pl.ordovita.identity.domain.model.token.AccessToken;
import pl.ordovita.identity.domain.model.token.TokenMetadata;
import pl.ordovita.identity.domain.model.token.TokenPair;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.model.userSession.Status;
import pl.ordovita.identity.domain.model.userSession.UserSession;
import pl.ordovita.identity.domain.model.userSession.UserSessionId;
import pl.ordovita.identity.domain.port.UserSessionRepository;

import java.time.Instant;
import java.util.Arrays;

@Component
@RequiredArgsConstructor
public class SessionManager implements SessionManagerUseCase {

    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";
    private static final int REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60;

    final TokenGenerator tokenGenerator;
    private final UserSessionRepository userSessionRepository;

    public TokenPair createNewSession(User user, String deviceName, String ipAddress, HttpServletResponse response) {
        UserSessionId sessionId = UserSessionId.generate();
        TokenMetadata metadata = new TokenMetadata(user.getId(), user.getEmail(), user.getRole(), sessionId);

        AccessToken accessToken = tokenGenerator.generateAccessToken(metadata);
        String refreshToken = tokenGenerator.generateRefreshToken(metadata);
        Instant expiresAt = tokenGenerator.calculateRefreshTokenExpiration();

        UserSession userSession = UserSession.create(
                refreshToken,
                deviceName,
                ipAddress,
                expiresAt,
                Status.ACTIVE,
                user.getId()
        );

        userSessionRepository.save(userSession);
        setRefreshTokenCookie(refreshToken, response);

        return TokenPair.of(accessToken, refreshToken);
    }

    public void setRefreshTokenCookie(String refreshToken, HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_TOKEN_COOKIE, refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(REFRESH_TOKEN_MAX_AGE)
                .sameSite("Strict")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }


    public String getRefreshTokenFromCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }

        return Arrays.stream(request.getCookies()).filter(cookie -> REFRESH_TOKEN_COOKIE.equals(cookie.getName())).findFirst().map(
                Cookie::getValue).orElse(null);
    }

    public void clearRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE, null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        cookie.setPath("/");
        cookie.setMaxAge(0);

        response.addCookie(cookie);
    }


}