package pl.ordovita.identity.application.port.out;

import pl.ordovita.identity.domain.model.token.AccessToken;
import pl.ordovita.identity.domain.model.token.TokenMetadata;

public interface TokenValidator {
    TokenMetadata validateAccessToken(AccessToken accessToken);
}
