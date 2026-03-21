package pl.ordovita.surveys.infrastructure.adapter.userResponse;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.infrastructure.adapter.persistence.user.UserEntityMapper;
import pl.ordovita.surveys.domain.model.userResponse.UserResponse;
import pl.ordovita.surveys.domain.model.userResponse.UserResponseId;
import pl.ordovita.surveys.domain.port.UserResponseRepository;
import pl.ordovita.surveys.infrastructure.adapter.questions.QuestionEntityMapper;
import pl.ordovita.surveys.infrastructure.jpa.userResponse.UserResponseEntity;
import pl.ordovita.surveys.infrastructure.jpa.userResponse.UserResponseJpaRepository;

import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

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

    @Override
    public Set<UserResponse> findAllByUserId(UserId id) {
        return userResponseJpaRepository.findAllByUserId(id.value()).stream().map(UserResponseEntityMapper::toDomain).collect(Collectors.toSet());
    }

    @Override
    public Optional<UserResponse> findByUserIdAndUserResponseId(UserId id, UserResponseId userResponseId) {
        return userResponseJpaRepository.findByUserIdAndUserResponseId(userResponseId.value(),id.value()).map(UserResponseEntityMapper::toDomain);
    }

    @Override
    public void delete(UserResponse userResponse) {
        userResponseJpaRepository.delete(UserResponseEntityMapper.from(userResponse));
    }
}
