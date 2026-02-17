package pl.ordovita.surveys.domain.port;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.surveys.domain.model.userResponse.UserResponse;
import pl.ordovita.surveys.domain.model.userResponse.UserResponseId;

import java.util.Optional;
import java.util.Set;

public interface UserResponseRepository {
    Optional<UserResponse> findById(UserResponseId id);
    UserResponse save(UserResponse userResponse);
    Set<UserResponse> findAllByUserId(UserId id);
}
