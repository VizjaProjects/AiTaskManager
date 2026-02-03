package pl.ordovita.identity.infrastructure.jwt;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.ordovita.identity.application.port.out.TokenGenerator;
import pl.ordovita.identity.domain.model.token.AccessToken;
import pl.ordovita.identity.domain.model.token.TokenMetadata;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class JwtTokenGeneratorAdapter implements TokenGenerator {

    private final JwtConfig jwtConfig;

    @Override
    public AccessToken generateAccessToken(TokenMetadata metadata) {
        Instant now = Instant.now();
        Instant expiryDate = now.plusMillis(jwtConfig.getAccessTokenExpiration());

        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", metadata.userId().value());
        claims.put("email", metadata.email().value());
        claims.put("role", metadata.role());
        claims.put("sessionId", metadata.sessionId().value());
        claims.put("type", "access");


        String jwt = Jwts.builder()
                .subject(metadata.email().value())
                .claims(claims)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiryDate))
                .issuer(jwtConfig.getIssuer())
                .audience().add(jwtConfig.getAudience()).and()
                .signWith(getSecretKey(),Jwts.SIG.HS256)
                .compact();

        return AccessToken.of(jwt);
    }

    @Override
    public String generateRefreshToken(TokenMetadata metadata) {
        return UUID.randomUUID().toString();
    }

    @Override
    public Instant calculateRefreshTokenExpiration() {
        return Instant.now().plusMillis(jwtConfig.getRefreshTokenExpiration());

    }

    private SecretKey getSecretKey() {
        byte[] keyBytes = jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
