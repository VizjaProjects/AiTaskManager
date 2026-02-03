package pl.ordovita.identity.infrastructure.adapter.security;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import pl.ordovita.identity.application.port.out.PasswordHasher;
import pl.ordovita.identity.domain.model.user.HashedPassword;
import pl.ordovita.identity.domain.model.user.RawPassword;

@Component
public class BCryptPasswordAdapter implements PasswordHasher {

    private final PasswordEncoder passwordEncoder;

    public BCryptPasswordAdapter(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public HashedPassword hash(RawPassword raw) {
        return new HashedPassword(passwordEncoder.encode(raw.value()));
    }

    @Override
    public boolean matches(RawPassword rawPassword, HashedPassword hashedPassword) {
        return passwordEncoder.matches(rawPassword.value(), hashedPassword.value());
    }
}
