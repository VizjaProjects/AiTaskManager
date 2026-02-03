package pl.ordovita.identity.infrastructure.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import pl.ordovita.identity.application.port.out.TokenValidator;
import pl.ordovita.identity.domain.exception.TokenException;
import pl.ordovita.identity.domain.model.token.AccessToken;
import pl.ordovita.identity.domain.model.token.TokenMetadata;
import pl.ordovita.identity.domain.port.AuthenticatedUser;
import pl.ordovita.identity.infrastructure.adapter.security.IdentityPrincipal;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final TokenValidator tokenValidator;

    private static UsernamePasswordAuthenticationToken getUsernamePasswordAuthenticationToken(TokenMetadata metadata) {
        AuthenticatedUser authenticatedUser = new AuthenticatedUser(metadata.userId(),
                metadata.email(),
                metadata.role());

        IdentityPrincipal identityPrincipal = new IdentityPrincipal(authenticatedUser);

        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + metadata.role().name()));


        return new UsernamePasswordAuthenticationToken(identityPrincipal, null, authorities);
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            String jwt = extractJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                AccessToken accessToken = AccessToken.of(jwt);
                TokenMetadata metadata = tokenValidator.validateAccessToken(accessToken);

                UsernamePasswordAuthenticationToken authenticationToken = getUsernamePasswordAuthenticationToken(
                        metadata);

                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }

        } catch (TokenException ex) {
            log.error("Cannot set user Authentication {}", ex.getMessage());
        } catch (Exception exception) {
            log.error("Unexpected error in JWT filter", exception);
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) throws ServletException {

        String path = request.getRequestURI();

        return path.startsWith("/v1/api/auth") || path.startsWith("/v1/api/emailVerification") || path.startsWith(
                "/swagger-ui/");
    }
}
