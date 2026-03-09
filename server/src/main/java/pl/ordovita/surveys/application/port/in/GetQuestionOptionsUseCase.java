package pl.ordovita.surveys.application.port.in;

import pl.ordovita.surveys.application.dto.QuestionOptionsResult;

import java.util.List;
import java.util.UUID;

public interface GetQuestionOptionsUseCase {

    record GetQuestionOptionsCommand(UUID questionId){}
    record GetQuestionOptionsResult(List<QuestionOptionsResult> questionsRespons) {}

    GetQuestionOptionsResult getQuestionOptions(GetQuestionOptionsCommand command);
}
