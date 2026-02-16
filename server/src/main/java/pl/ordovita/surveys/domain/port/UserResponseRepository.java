package pl.ordovita.surveys.domain.port;

import pl.ordovita.surveys.domain.model.userResponse.UserResponse;
import pl.ordovita.surveys.domain.model.userResponse.UserResponseId;

import java.util.Optional;

public interface UserResponseRepository {
    Optional<UserResponse> findById(UserResponseId id);
    UserResponse save(UserResponse userResponse);
}
