package pl.ordovita.identity.domain.model.token;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import static org.junit.jupiter.api.Assertions.*;

class AccessTokenTest {

    @Test
    @DisplayName("Should create access token")
    void shouldCreateAccessToken() {
        String tokenValue = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
        AccessToken token = AccessToken.of(tokenValue);

        assertNotNull(token);
        assertEquals(tokenValue, token.value());
    }

    @Test
    @DisplayName("Should compare access tokens correctly")
    void shouldCompareAccessTokensCorrectly() {
        String tokenValue = "token123";
        AccessToken token1 = AccessToken.of(tokenValue);
        AccessToken token2 = AccessToken.of(tokenValue);

        assertEquals(token1.value(), token2.value());
    }
}
