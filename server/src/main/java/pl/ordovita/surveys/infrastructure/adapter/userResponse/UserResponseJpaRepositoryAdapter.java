package pl.ordovita.surveys.infrastructure.adapter.userResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.surveys.domain.model.userResponse.UserResponse;
import pl.ordovita.surveys.domain.model.userResponse.UserResponseId;
import pl.ordovita.surveys.domain.port.UserResponseRepository;
import pl.ordovita.surveys.infrastructure.jpa.userResponse.UserResponseEntity;
import pl.ordovita.surveys.infrastructure.jpa.userResponse.UserResponseJpaRepository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class UserResponseJpaRepositoryAdapter implements UserResponseRepository {

    private final UserResponseJpaRepository userResponseJpaRepository;

    @Override
    public Optional<UserResponse> findById(UserResponseId id) {
        return userResponseJpaRepository.findById(id.value()).map(UserResponseEntityMapper::toDomain);
    }

    @Override
    public UserResponse save(UserResponse userResponse) {
        UserResponseEntity entity = UserResponseEntityMapper.from(userResponse);
        return UserResponseEntityMapper.toDomain(userResponseJpaRepository.save(entity));
    }
}
