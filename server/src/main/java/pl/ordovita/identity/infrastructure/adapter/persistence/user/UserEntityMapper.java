package pl.ordovita.identity.infrastructure.adapter.persistence.user;

import pl.ordovita.identity.domain.model.user.Email;
import pl.ordovita.identity.domain.model.user.HashedPassword;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;

public class UserEntityMapper {

    public static UserEntity from(User user) {

        return new UserEntity(user.getId().value(),
                user.getFullName(),
                user.getEmail().value(),
                user.getRole(),
                user.getHashedPassword().value(),
                user.getCreatedAt(),
                user.getUpdatedAt(),
                user.getLastLoginAt(),
                user.isEnabled(),
                user.isEmailVerified(),
                user.getEmailVerifiedAt()

        );
    }


    public static User toDomain(UserEntity userEntity) {
        return new User(new UserId(userEntity.getId()),
                userEntity.getFullName(),
                new Email(userEntity.getEmail()),
                userEntity.getRole(),
                new HashedPassword(userEntity.getPassword()),
                userEntity.getCreatedAt(),
                userEntity.getUpdatedAt(),
                userEntity.getLastLoginAt(),
                userEntity.isEnabled(),
                userEntity.isEmailVerified(),
                userEntity.getEmailVerifiedAt());
    }
}
