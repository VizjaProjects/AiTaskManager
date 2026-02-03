package pl.ordovita.identity.infrastructure.adapter.persistence.userSession;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.domain.model.userSession.UserSession;
import pl.ordovita.identity.domain.model.userSession.UserSessionId;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;
import pl.ordovita.identity.infrastructure.jpa.userSesion.UserSessionEntity;

public class UserSessionMapper {


    public static UserSessionEntity from(UserSession userSession) {
        UserEntity userReference = UserEntity.builder().id(userSession.getUserId().value()).build();
        return new UserSessionEntity(userSession.getId().value(),
                userSession.getRefreshToken(),
                userSession.getDeviceName(),
                userSession.getUserSessionIp(),
                userSession.getCreatedAt(),
                userSession.getUpdatedAt(),
                userSession.getExpiresAt(),
                userSession.getStatus(),
                userReference);
    }

    public static UserSession toDomain(UserSessionEntity entity) {
        return new UserSession(new UserSessionId(entity.getId()),
                entity.getRefreshToken(),
                entity.getDeviceName(),
                entity.getUserSessionIp(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                entity.getExpiresAt(),
                entity.getStatus(),
                new UserId(entity.getUser().getId()));
    }
}
