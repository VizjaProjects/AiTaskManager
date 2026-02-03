package pl.ordovita.identity.infrastructure.adapter.persistence.emailVerification;

import jakarta.persistence.EntityManager;
import pl.ordovita.identity.domain.model.emailVerification.EmailVerification;
import pl.ordovita.identity.domain.model.emailVerification.EmailVerificationId;
import pl.ordovita.identity.domain.model.emailVerification.VerificationCode;
import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.infrastructure.jpa.emailVerification.EmailVerificationEntity;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;

public class EmailVerificationEntityMapper {

    public static EmailVerificationEntity from(EmailVerification emailVerification) {
        UserEntity userReference = UserEntity.builder().id(emailVerification.getUserId().value()).build();
        return new EmailVerificationEntity(emailVerification.getId().value(),
                userReference,
                emailVerification.getEmail().value(),
                emailVerification.getCode().value(),
                emailVerification.getExpiresAt(),
                emailVerification.getCreatedAt(),
                emailVerification.isVerified(),
                emailVerification.getVerifiedAt());
    }

    public static EmailVerification toDomain(EmailVerificationEntity entity) {
        return new EmailVerification(
                new EmailVerificationId(entity.getId()),
                new UserId(entity.getUser().getId()),
                new Email(entity.getEmail()),
                new VerificationCode(entity.getCode()),
                entity.getExpiresAt(),
                entity.getCreatedAt(),
                entity.isVerified(),
                entity.getVerifiedAt()
        );
    }
}
