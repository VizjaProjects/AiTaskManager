package pl.ordovita.surveys.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.surveys.application.port.in.AddResponseToSurveyUseCase;
import pl.ordovita.surveys.application.port.in.ChangeUserResponseUseCase;
import pl.ordovita.surveys.application.port.in.DeleteUserResponseUseCase;
import pl.ordovita.surveys.application.port.in.GetAllUserResponseUseCase;
import pl.ordovita.surveys.domain.exception.QuestionException;
import pl.ordovita.surveys.domain.exception.UserResponseException;
import pl.ordovita.surveys.domain.model.questions.Question;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;
import pl.ordovita.surveys.domain.model.userResponse.TextAnswer;
import pl.ordovita.surveys.domain.model.userResponse.UserResponse;
import pl.ordovita.surveys.domain.model.userResponse.UserResponseId;
import pl.ordovita.surveys.domain.port.QuestionRepository;
import pl.ordovita.surveys.domain.port.SurveyRepository;
import pl.ordovita.surveys.domain.port.UserResponseRepository;

import java.time.Instant;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserResponseUseCaseService implements AddResponseToSurveyUseCase, DeleteUserResponseUseCase, ChangeUserResponseUseCase, GetAllUserResponseUseCase {

    private final QuestionRepository questionRepository;
    private final UserResponseRepository userResponseRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;
    private final SurveyRepository surveyRepository;


    @Override
    public AddResponseResult addResponse(AddResponseCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id()).orElseThrow(() -> new UserException(
                "User not found"));
        SurveyId surveyId = new SurveyId(command.surveyId());
        QuestionId questionId = new QuestionId(command.questionId());
        Question question = questionRepository.findById(questionId).orElseThrow(() -> new QuestionException(
                "Question not found!"));

        Set<UserResponse> userResponses = userResponseRepository.findAllByUserId(user.getId());
        userResponses.forEach(ur -> {
            if(ur.getQuestionId().equals(questionId)) {
                throw new UserResponseException("UserResponse already answered");
            }
        });


        TextAnswer textAnswer = new TextAnswer(command.answer());
        UserResponse userResponse = UserResponse.create(user.getId(), question.getId(), textAnswer);
        userResponseRepository.save(userResponse);


        return new AddResponseResult(question.getId().value(), surveyId.value(), command.answer(), Instant.now());
    }


    @Override
    public void deleteUserResponse(DeleteUserResponseCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id()).orElseThrow(() -> new UserException(
                "User not found"));
        UserResponseId userResponseId = new UserResponseId(command.userResponseId());
        UserResponse userResponse = userResponseRepository.findByUserIdAndUserResponseId(user.getId(),
                userResponseId).orElseThrow(() -> new UserResponseException("UserResponse not found"));

        userResponseRepository.delete(userResponse);
    }

    @Override
    public ChangeUserResponseResult changeUserResponse(ChangeUserResponseCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id()).orElseThrow(() -> new UserException(
                "User not found"));
        UserResponseId userResponseId = new UserResponseId(command.userResponseId());

        UserResponse userResponse = userResponseRepository.findByUserIdAndUserResponseId(user.getId(),
                userResponseId).orElseThrow(() -> new UserResponseException("UserResponse not found"));
        TextAnswer newTextAnswer = new TextAnswer(command.newTextAnswer());
        userResponse.changeResponse(newTextAnswer);

        UserResponse changedUserResponse = userResponseRepository.save(userResponse);

        return new ChangeUserResponseResult(changedUserResponse.getId().value(),
                changedUserResponse.getTextAnswer().value(),
                changedUserResponse.getUpdatedAt());

    }

    @Override
    public GetAllUserResponseResult getAllUserResponse() {
        User user = userRepository.findById(currentUser.requireAuthenticated().id()).orElseThrow(() -> new UserException(
                "User not found"));

        return new GetAllUserResponseResult(surveyRepository.getAllUserResponseResults(user.getId()));
    }
}
