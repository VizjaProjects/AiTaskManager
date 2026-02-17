package pl.ordovita.surveys.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.surveys.application.dto.UserAnswer;
import pl.ordovita.surveys.application.port.in.AddResponseToSurveyUseCase;
import pl.ordovita.surveys.domain.model.questions.Question;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;
import pl.ordovita.surveys.domain.model.userResponse.TextAnswer;
import pl.ordovita.surveys.domain.model.userResponse.UserResponse;
import pl.ordovita.surveys.domain.port.QuestionRepository;
import pl.ordovita.surveys.domain.port.UserResponseRepository;

import java.time.Instant;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserResponseService implements AddResponseToSurveyUseCase {

    private final QuestionRepository questionRepository;
    private final UserResponseRepository userResponseRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;


    @Override
    public AddResponseResult addResponse(AddResponseCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id()).orElseThrow(() -> new UserException(
                "User not found"));
        SurveyId surveyId = new SurveyId(command.surveyId());
        Set<Question> questionSet = questionRepository.findAllBySurveyId(surveyId);

        for (Question question : questionSet) {
//            String answer = command.answerSet().stream().filter(us -> new QuestionId(us.questionId()).equals(question.getId())).toString();
            String answer = command.answerSet().stream().filter(us -> us.questionId().equals(question.getId().value())).map(
                    UserAnswer::answer).findFirst().orElse("");
            TextAnswer textAnswer = new TextAnswer(answer);
            UserResponse userResponse = UserResponse.create(user.getId(), question.getId(), textAnswer);
            userResponseRepository.save(userResponse);
        }


        return new AddResponseResult(surveyId.value(), command.answerSet(), Instant.now());
    }
}
