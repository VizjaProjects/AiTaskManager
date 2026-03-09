package pl.ordovita.surveys.application.port.in;

import pl.ordovita.surveys.domain.model.surveys.Survey;

import java.util.Set;

public interface GetAllSurveysUseCase {

    record GetAllActiveSurveysResult(Set<Survey> surveys) {}
    record GetAllSurveysResult(Set<Survey> surveys) {}

    GetAllActiveSurveysResult getAllActiveSurveys();
    GetAllSurveysResult getAllSurveys();
}
