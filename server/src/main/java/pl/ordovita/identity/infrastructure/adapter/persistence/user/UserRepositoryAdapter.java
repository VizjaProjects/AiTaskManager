package pl.ordovita.identity.infrastructure.adapter.persistence.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;
import pl.ordovita.identity.infrastructure.jpa.user.UserJpaRepository;
import pl.ordovita.shared.domain.event.DomainEventPublisher;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserRepositoryAdapter implements UserRepository {

    private final UserJpaRepository repository;
    @Override
    public User save(User user) {
        UserEntity entity = UserEntityMapper.from(user);
        UserEntity saved = repository.save(entity);
        return UserEntityMapper.toDomain(saved);
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return repository.findByEmail(email.value()).map(UserEntityMapper::toDomain);
    }

    @Override
    public Optional<User> findByFullName(String fullName) {
        return repository.findByFullName(fullName).map(UserEntityMapper::toDomain);
    }

    @Override
    public Optional<User> findById(UserId userId) {
        return repository.findById(userId.value()).map(UserEntityMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(Email email) {
        return repository.existsByEmail(email.value());
    }
}
