package pl.ordovita.surveys.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.ordovita.surveys.application.dto.QuestionOptionsResult;
import pl.ordovita.surveys.application.dto.QuestionsResult;
import pl.ordovita.surveys.application.port.in.*;
import pl.ordovita.surveys.domain.exception.QuestionException;
import pl.ordovita.surveys.domain.exception.SurveyException;
import pl.ordovita.surveys.domain.model.questionOption.OptionText;
import pl.ordovita.surveys.domain.model.questionOption.QuestionOption;
import pl.ordovita.surveys.domain.model.questions.Question;
import pl.ordovita.surveys.domain.model.questions.QuestionId;
import pl.ordovita.surveys.domain.model.questions.QuestionType;
import pl.ordovita.surveys.domain.model.surveys.Survey;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;
import pl.ordovita.surveys.domain.port.QuestionOptionRepository;
import pl.ordovita.surveys.domain.port.QuestionRepository;
import pl.ordovita.surveys.domain.port.SurveyRepository;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class QuestionUseService implements CreateQuestionSurveyUseCase, GetAllSurveyQuestionsUseCase, GetQuestionOptionsUseCase, EditQuestionUseCase, DeleteQuestionUseCase {

    private final QuestionRepository questionRepository;
    private final SurveyRepository surveyRepository;
    private final QuestionOptionRepository questionOptionRepository;

    @Override
    @Transactional
    public CreateQuestionSurveyResult create(CreateQuestionSurveyCommand command) {
        SurveyId surveyId = new SurveyId(command.surveyUUID());
        Survey survey = surveyRepository.findById(surveyId).orElseThrow(() -> new SurveyException("Survey with id " + surveyId + " not found"));

        Question question = Question.create(command.questionText(),
                survey.getId(),
                command.questionType(),
                command.isRequired(),
                command.hint());

        questionRepository.save(question);

        if (command.questionType().equals(QuestionType.LIST) && command.optionTextValue().isEmpty())
            throw new QuestionException("If question type is list option list cannot be null!");

        if (!command.optionTextValue().isEmpty()) {
            for (String optionTextValue : command.optionTextValue()) {
                OptionText optionText = new OptionText(optionTextValue);
                QuestionOption questionOption = QuestionOption.create(question.getId(), optionText);

                questionOptionRepository.save(questionOption);
            }
        }


        return new CreateQuestionSurveyResult(survey.getId().value(),
                question.getId().value(),
                question.getCreatedAt());
    }

    @Override
    public GetAllSurveyQuestionsResult getQuestions(GetAllSurveyQuestionsCommand command) {

        if (command.surveyId() == null) throw new QuestionException("Survey id cannot be null!");

        SurveyId surveyId = new SurveyId(command.surveyId());
        Set<Question> questionSet = questionRepository.findAllBySurveyId(surveyId);


        Set<QuestionsResult> questionResponses = questionSet.stream().map(question -> new QuestionsResult(question.getId().value(),
                question.getQuestionText(),
                question.getQuestionType(),
                question.getHint())).collect(Collectors.toSet());


        return new GetAllSurveyQuestionsResult(questionResponses);
    }

    @Override
    public GetQuestionOptionsResult getQuestionOptions(GetQuestionOptionsCommand command) {
        QuestionId questionId = new QuestionId(command.questionId());
        List<QuestionOptionsResult> questionOptionsResultList = questionOptionRepository.findAllByQuestionId(questionId).stream().map(
                questionOption -> new QuestionOptionsResult(questionOption.getId().value(),questionOption.getOptionText().value())).toList();

        return new GetQuestionOptionsResult(questionOptionsResultList);
    }

    @Override
    public EditQuestionResult edit(EditQuestionCommand command) {
        QuestionId questionId = new QuestionId(command.questionId());
        Question question = questionRepository.findById(questionId).orElseThrow(() -> new QuestionException("Question with id " + questionId + " not found"));

        question.edit(command.questionText(),command.questionType(),command.isRequired(),command.hint());
        Question updatedQuestion = questionRepository.save(question);
        return new EditQuestionResult(updatedQuestion.getId().value(), updatedQuestion.getUpdatedAt());
    }

    @Override
    public DeleteQuestionResult deleteQuestion(DeleteQuestionCommand command) {
        QuestionId questionId = new QuestionId(command.questionId());
        Question question = questionRepository.findById(questionId).orElseThrow(() -> new QuestionException("Question with id " + questionId + " not found"));

        question.deleteQuestion(questionId);
        Question editedQuestion = questionRepository.save(question);

        return new DeleteQuestionResult(editedQuestion.getId().value(), editedQuestion.getUpdatedAt());

    }

}
