package pl.ordovita.surveys.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.surveys.application.port.in.CreateQuestionSurveyUseCase;
import pl.ordovita.surveys.domain.exception.QuestionException;
import pl.ordovita.surveys.domain.exception.SurveyException;
import pl.ordovita.surveys.domain.model.questionOption.OptionText;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOption;
import pl.ordovita.surveys.domain.model.questions.Question;
import pl.ordovita.surveys.domain.model.questions.QuestionType;
import pl.ordovita.surveys.domain.model.surveys.Survey;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;
import pl.ordovita.surveys.domain.port.QuestionOptionRepository;
import pl.ordovita.surveys.domain.port.QuestionRepository;
import pl.ordovita.surveys.domain.port.SurveyRepository;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class QuestionService implements CreateQuestionSurveyUseCase {

    private final QuestionRepository questionRepository;
    private final SurveyRepository surveyRepository;
    private final QuestionOptionRepository questionOptionRepository;

    @Override
    public CreateQuestionSurveyResult create(CreateQuestionSurveyCommand command) {
        SurveyId surveyId = new SurveyId(command.surveyUUID());
        Survey survey = surveyRepository.findById(surveyId).orElseThrow(() -> new SurveyException("Survey with id " + surveyId + " not found"));

        Question question = Question.create(command.questionText(),survey.getId(),null, command.questionType(), command.isRequired());

        if(command.questionType().equals(QuestionType.LIST) && command.optionTextValue().isEmpty()) throw new QuestionException("If question type is list option list cannot be null!");

        if(!command.optionTextValue().isEmpty()) {
            Set<QuestionOption> questionOptionSet = new HashSet<>();
            for (String optionTextValue : command.optionTextValue()) {
                OptionText optionText = new OptionText(optionTextValue);
                QuestionOption questionOption = QuestionOption.create(question.getId(), optionText);

                questionOptionSet.add(questionOption);
                questionOptionRepository.save(questionOption);
            }
            question.addOption(questionOptionSet);
        }


        questionRepository.save(question);

        return new CreateQuestionSurveyResult(survey.getId().value(),question.getId().value(),question.getCreatedAt());
    }
}
