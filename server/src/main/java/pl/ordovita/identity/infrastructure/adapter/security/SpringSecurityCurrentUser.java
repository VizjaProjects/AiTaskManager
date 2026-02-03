package pl.ordovita.identity.infrastructure.adapter.security;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import pl.ordovita.identity.domain.port.AuthenticatedUser;
import pl.ordovita.identity.domain.port.CurrentUser;

import java.util.Optional;

@Component
public class SpringSecurityCurrentUser implements CurrentUser {

    @Override
    public Optional<AuthenticatedUser> get() {
        var context = SecurityContextHolder.getContext().getAuthentication();

        if (context == null || !context.isAuthenticated()) {
            return Optional.empty();
        }

        Object principal = context.getPrincipal();

        if (principal instanceof IdentityPrincipal identityPrincipal) {
            return Optional.of(identityPrincipal.getAuthenticatedUser());
        }

        return Optional.empty();
    }
}
