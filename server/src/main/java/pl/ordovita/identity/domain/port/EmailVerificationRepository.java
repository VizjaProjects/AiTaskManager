package pl.ordovita.identity.domain.port;

import pl.ordovita.identity.domain.model.emailVerification.EmailVerification;
import pl.ordovita.identity.domain.model.emailVerification.EmailVerificationId;
import pl.ordovita.identity.domain.model.emailVerification.VerificationCode;
import pl.ordovita.identity.domain.model.user.UserId;

import java.util.Optional;

public interface EmailVerificationRepository {

    EmailVerification save(EmailVerification verification);

    Optional<EmailVerification> findById(EmailVerificationId id);

    Optional<EmailVerification> findActiveByUserId(UserId userId);

    Optional<EmailVerification> findByUserIdAndCode(UserId userId, VerificationCode code);

    void deleteExpired();

}
