package pl.ordovita.identity.domain.model.token;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class TokenPairTest {

    @Test
    @DisplayName("Should create token pair")
    void shouldCreateTokenPair() {
        AccessToken accessToken = AccessToken.of("accessToken");
        String refreshToken = "refreshToken";

        TokenPair tokenPair = TokenPair.of(accessToken, refreshToken);

        assertNotNull(tokenPair);
        assertEquals(accessToken, tokenPair.accessToken());
        assertEquals(refreshToken, tokenPair.refreshToken());
    }

    @Test
    @DisplayName("Should have both access and refresh tokens")
    void shouldHaveBothAccessAndRefreshTokens() {
        AccessToken accessToken = AccessToken.of("accessToken123");
        String refreshToken = "refreshToken456";

        TokenPair tokenPair = TokenPair.of(accessToken, refreshToken);

        assertEquals("accessToken123", tokenPair.accessToken().value());
        assertEquals("refreshToken456", tokenPair.refreshToken());
    }
}
