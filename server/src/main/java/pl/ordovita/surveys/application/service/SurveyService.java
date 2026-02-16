package pl.ordovita.surveys.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.surveys.application.port.in.CreateSurveyUseCase;
import pl.ordovita.surveys.domain.model.surveys.Survey;
import pl.ordovita.surveys.domain.port.SurveyRepository;

@Service
@RequiredArgsConstructor
public class SurveyService implements CreateSurveyUseCase {

    private final SurveyRepository surveyRepository;

    @Override
    public CreateSurveyResult createSurvey(CreateSurveyCommand command) {

        Survey survey = Survey.create(command.title(), command.description());
        surveyRepository.save(survey);


        return new CreateSurveyResult(survey.getId().value(),survey.getCreatedAt());
    }
}
