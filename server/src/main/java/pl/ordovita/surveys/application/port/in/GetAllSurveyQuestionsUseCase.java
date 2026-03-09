package pl.ordovita.surveys.application.port.in;

import pl.ordovita.surveys.application.dto.QuestionsResult;

import java.util.Set;
import java.util.UUID;

public interface GetAllSurveyQuestionsUseCase {

    record GetAllSurveyQuestionsCommand(UUID surveyId){}
    record GetAllSurveyQuestionsResult(Set<QuestionsResult> questionsRespons) {}

    GetAllSurveyQuestionsResult getQuestions(GetAllSurveyQuestionsCommand command);
}
