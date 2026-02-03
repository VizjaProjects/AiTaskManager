package pl.ordovita.identity.domain.model.token;

public record TokenPair(
        AccessToken accessToken,
        String refreshToken
) {
    public TokenPair {
        if (accessToken == null) {
            throw new IllegalArgumentException("Access token cannot be null");
        }
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalArgumentException("Refresh token cannot be null");
        }
    }

    public static TokenPair of(AccessToken accessToken, String refreshToken) {
        return new TokenPair(accessToken, refreshToken);
    }
}