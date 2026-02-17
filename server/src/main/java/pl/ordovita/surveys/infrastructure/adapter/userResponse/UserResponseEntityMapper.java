package pl.ordovita.surveys.infrastructure.adapter.userResponse;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.domain.model.userResponse.TextAnswer;
import pl.ordovita.surveys.domain.model.userResponse.UserResponse;
import pl.ordovita.surveys.domain.model.userResponse.UserResponseId;
import pl.ordovita.surveys.infrastructure.jpa.questions.QuestionEntity;
import pl.ordovita.surveys.infrastructure.jpa.userResponse.UserResponseEntity;

public class UserResponseEntityMapper {

    public static UserResponseEntity from(UserResponse userResponse) {
        UserEntity userEntity = new UserEntity();
        userEntity.setId(userResponse.getUserId().value());

        QuestionEntity questionEntity = new QuestionEntity();
        questionEntity.setId(userResponse.getQuestionId().value());

        return new UserResponseEntity(
                userResponse.getId().value(),
                userEntity,
                questionEntity,
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
