package pl.ordovita.identity.infrastructure.adapter.security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import pl.ordovita.identity.domain.port.AuthenticatedUser;

import java.security.Principal;

@Getter
@RequiredArgsConstructor
public class IdentityPrincipal implements Principal {

    private final AuthenticatedUser authenticatedUser;

    @Override
    public String getName() {
        return authenticatedUser.id().value().toString();
    }
}
