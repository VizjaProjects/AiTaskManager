package pl.ordovita.identity.infrastructure.config;

import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import pl.ordovita.identity.domain.port.AuthenticatedUser;
import pl.ordovita.identity.infrastructure.jwt.JwtAuthenticationEntryPoint;
import pl.ordovita.identity.infrastructure.jwt.JwtAuthenticationFilter;
import pl.ordovita.identity.infrastructure.security.CorsConfig;

@Configuration
@EnableWebSecurity
@AllArgsConstructor
public class WebConfig {

    private final CorsConfig corsConfig;
    private final JwtAuthenticationEntryPoint  jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers( headers -> headers.httpStrictTransportSecurity(HeadersConfigurer.HstsConfig::disable))
                .authorizeHttpRequests( auth -> auth
                        .requestMatchers("/v1/api/auth/*", "/v1/api/emailVerification/*").permitAll()
                        .requestMatchers("/swagger-ui/*", "/v3/api-docs/**").permitAll()
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
