package pl.ordovita.identity.infrastructure.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import pl.ordovita.identity.application.port.out.TokenValidator;
import pl.ordovita.identity.domain.exception.TokenException;
import pl.ordovita.identity.domain.model.token.AccessToken;
import pl.ordovita.identity.domain.model.token.TokenMetadata;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.Role;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.domain.model.userSession.UserSessionId;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtTokenValidatorAdapter implements TokenValidator {

    private final JwtConfig jwtConfig;

    @Override
    public TokenMetadata validateAccessToken(AccessToken accessToken) {
        try {
            Claims claims = parseToken(accessToken.toString());

            String userIdStr = claims.get("userId", String.class);
            String email = claims.get("email", String.class);
            String roleStr = claims.get("role", String.class);
            String sessionIdStr = claims.get("sessionId", String.class);

            return new TokenMetadata(
                    new UserId(UUID.fromString(userIdStr)),
                    new Email(email),
                    Role.valueOf(roleStr),
                    new UserSessionId(UUID.fromString(sessionIdStr))
            );
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
            throw new TokenException("JWT token is expired");
        } catch (SignatureException ex) {
            log.error("Invalid JWT signature");
            throw new TokenException("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
            throw new TokenException("Invalid JWT token");
        } catch (Exception ex) {
            log.error("JWT validation error", ex);
            throw new TokenException("JWT validation failed");
        }
    }

    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .requireIssuer(jwtConfig.getIssuer())
                .requireAudience(jwtConfig.getAudience())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSecretKey() {
        byte[] keyBytes = jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
