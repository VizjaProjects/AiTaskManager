package pl.ordovita.surveys.infrastructure.adapter.userResponse;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.domain.model.userResponse.TextAnswer;
import pl.ordovita.surveys.domain.model.userResponse.UserResponse;
import pl.ordovita.surveys.domain.model.userResponse.UserResponseId;
import pl.ordovita.surveys.infrastructure.jpa.userResponse.UserResponseEntity;

public class UserResponseEntityMapper {

    public static UserResponseEntity from(UserResponse userResponse) {
        UserResponseEntity userResponseEntity = UserResponseEntity.builder().id(userResponse.getId().value()).build();
        return new UserResponseEntity(
                userResponse.getId().value(),
                userResponseEntity.getUserId(),
                userResponseEntity.getQuestionId(),
                userResponse.getTextAnswer().value(),
                userResponse.getCreatedAt(),
                userResponse.getUpdatedAt()
        );
    }

    public static UserResponse toDomain(UserResponseEntity userResponseEntity) {
        return new UserResponse(
                new UserResponseId(userResponseEntity.getId()),
                new UserId(userResponseEntity.getUserId().getId()),
                new QuestionId(userResponseEntity.getQuestionId().getId()),
                new TextAnswer(userResponseEntity.getTextAnswer()),
                userResponseEntity.getCreatedAt(),
                userResponseEntity.getUpdatedAt()
        );
    }
}
