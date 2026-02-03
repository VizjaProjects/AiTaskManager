package pl.ordovita.identity.application.port.out;

import pl.ordovita.identity.domain.model.token.AccessToken;
import pl.ordovita.identity.domain.model.token.TokenMetadata;

import java.time.Instant;

public interface TokenGenerator {
    AccessToken generateAccessToken(TokenMetadata metadata);
    String generateRefreshToken(TokenMetadata metadata);
    Instant calculateRefreshTokenExpiration();
}
