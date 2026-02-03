package pl.ordovita.identity.infrastructure.adapter.persistence.passwordRestart;

import pl.ordovita.identity.domain.model.passwordRestart.PasswordRestart;
import pl.ordovita.identity.domain.model.passwordRestart.PasswordRestartId;
import pl.ordovita.identity.domain.model.user.HashedPassword;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.infrastructure.jpa.passwordRestart.PasswordRestartEntity;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;

public class PasswordRestartEntityMapper {

    public static PasswordRestartEntity from(PasswordRestart passwordRestart) {
        UserEntity userEntity = UserEntity.builder().id(passwordRestart.getUserId().value()).build();

        return new PasswordRestartEntity(passwordRestart.getId().value(),
                passwordRestart.getToken(),
                passwordRestart.getExpresAt(),
                passwordRestart.isUsed(),
                passwordRestart.getHashedPassword().value(),
                passwordRestart.getCreatedAt(),
                passwordRestart.getCreatedAt(),
                userEntity);
    }

    public static PasswordRestart toDomain(PasswordRestartEntity passwordRestartEntity) {
        return new PasswordRestart(new PasswordRestartId(passwordRestartEntity.getId()),
                passwordRestartEntity.getToken(),
                passwordRestartEntity.getExpresAt(),
                passwordRestartEntity.isUsed(),
                new HashedPassword(passwordRestartEntity.getRawPassword()),
                passwordRestartEntity.getCreatedAt(),
                passwordRestartEntity.getUpdatedAt(),
                new UserId(passwordRestartEntity.getUser().getId()));
    }
}
