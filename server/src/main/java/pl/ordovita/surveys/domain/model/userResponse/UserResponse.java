package pl.ordovita.surveys.domain.model.userResponse;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.surveys.domain.exception.UserResponseException;
import pl.ordovita.surveys.domain.model.questions.QuestionId;

import java.time.Instant;
import java.util.List;

public class UserResponse {

    private final UserResponseId id;
    private final UserId userId;
    private final QuestionId questionId;
    private final TextAnswer textAnswer;
    private final Instant createdAt;
    private final Instant updatedAt;

    public UserResponse(UserResponseId id, UserId userId, QuestionId questionId, TextAnswer textAnswer, Instant createdAt, Instant updatedAt) {
        if (id==null) throw new UserResponseException("id cannot be null");
        if (userId==null) throw new UserResponseException("userId cannot be null");
        if (questionId==null) throw new UserResponseException("questionId cannot be null");
        if (textAnswer==null) throw new UserResponseException("textAnswer cannot be null");
        if (createdAt==null) throw new UserResponseException("createdAt cannot be null");
        if (updatedAt==null) throw new UserResponseException("updatedAt cannot be null");
        this.id = id;
        this.userId = userId;
        this.questionId = questionId;
        this.textAnswer = textAnswer;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static UserResponse create(UserId userId, QuestionId questionId, TextAnswer textAnswer) {
        return new UserResponse(UserResponseId.generate(), userId, questionId, textAnswer, Instant.now(), Instant.now());
    }

    //TODO
//    public boolean checkIfAlreadyAnswered(List<QuestionId> questionIdList) {
//        if (questionIdList.contains(this.questionId)) return false;
//    }


    public UserResponseId getId() {
        return id;
    }

    public UserId getUserId() {
        return userId;
    }

    public QuestionId getQuestionId() {
        return questionId;
    }

    public TextAnswer getTextAnswer() {
        return textAnswer;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
