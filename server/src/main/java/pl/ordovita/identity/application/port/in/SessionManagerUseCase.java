package pl.ordovita.identity.application.port.in;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import pl.ordovita.identity.domain.model.token.TokenPair;
import pl.ordovita.identity.domain.model.user.User;

public interface SessionManagerUseCase {

    TokenPair createNewSession(User user, String deviceName, String ipAddress, HttpServletResponse response);
    void setRefreshTokenCookie(String refreshToken, HttpServletResponse response);
    String getRefreshTokenFromCookie(HttpServletRequest request);
    void clearRefreshTokenCookie(HttpServletResponse response);
}
