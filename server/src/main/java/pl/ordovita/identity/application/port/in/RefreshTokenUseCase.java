package pl.ordovita.identity.application.port.in;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import pl.ordovita.identity.domain.model.token.TokenPair;

public interface RefreshTokenUseCase {

    record RefreshCommand(String refreshToken) {}

    TokenPair refresh(RefreshCommand command, HttpServletResponse response, HttpServletRequest httpRequest);
}
