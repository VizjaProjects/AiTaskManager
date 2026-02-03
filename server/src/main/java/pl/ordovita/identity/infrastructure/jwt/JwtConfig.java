package pl.ordovita.identity.infrastructure.jwt;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
@Getter
@Setter
public class JwtConfig {

    private String secret;
    private String issuer;
    private String audience;
    private Long accessTokenExpiration;
    private Long refreshTokenExpiration;
}
