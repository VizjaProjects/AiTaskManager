package pl.ordovita.identity.infrastructure.adapter.persistence.emailVerification;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.identity.domain.model.emailVerification.EmailVerification;
import pl.ordovita.identity.domain.model.emailVerification.EmailVerificationId;
import pl.ordovita.identity.domain.model.emailVerification.VerificationCode;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.domain.port.EmailVerificationRepository;
import pl.ordovita.identity.infrastructure.jpa.emailVerification.EmailVerificationEntity;
import pl.ordovita.identity.infrastructure.jpa.emailVerification.EmailVerificationJpaRepository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class EmailVerificationRepositoryAdapter implements EmailVerificationRepository {

    private final EmailVerificationJpaRepository repository;


    @Override
    public EmailVerification save(EmailVerification verification) {
        EmailVerificationEntity entity = EmailVerificationEntityMapper.from(verification);
        return EmailVerificationEntityMapper.toDomain(repository.save(entity));
    }

    @Override
    public Optional<EmailVerification> findById(EmailVerificationId id) {
        return repository.findById(id.value()).map(EmailVerificationEntityMapper::toDomain);
    }

    @Override
    public Optional<EmailVerification> findActiveByUserId(UserId userId) {
        return repository.findActiveByUserId(userId.value()).map(EmailVerificationEntityMapper::toDomain);
    }

    @Override
    public Optional<EmailVerification> findByUserIdAndCode(UserId userId, VerificationCode code) {
        return repository.findByUserIdAndCode(userId.value(), code.value()).map(EmailVerificationEntityMapper::toDomain);
    }

    @Override
    public void deleteExpired() {
        repository.deleteExpired();
    }

}
