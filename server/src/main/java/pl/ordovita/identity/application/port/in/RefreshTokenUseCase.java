package pl.ordovita.identity.application.port.in;

import pl.ordovita.identity.domain.model.token.TokenPair;

public interface RefreshTokenUseCase {

    record RefreshCommand(String refreshToken, String deviceName, String ipAddress, String userAgent) {}

    TokenPair refresh(RefreshCommand command);
}
