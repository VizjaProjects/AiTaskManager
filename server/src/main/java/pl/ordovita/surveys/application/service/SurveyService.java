package pl.ordovita.surveys.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.surveys.application.port.in.ChangeVisibleUseCase;
import pl.ordovita.surveys.application.port.in.CreateSurveyUseCase;
import pl.ordovita.surveys.application.port.in.DeleteSurveyUseCase;
import pl.ordovita.surveys.application.port.in.EditSurveyUseCase;
import pl.ordovita.surveys.application.port.in.GetAllSurveysUseCase;
import pl.ordovita.surveys.domain.exception.SurveyException;
import pl.ordovita.surveys.domain.model.surveys.Survey;
import pl.ordovita.surveys.domain.model.surveys.SurveyId;
import pl.ordovita.surveys.domain.port.SurveyRepository;

import java.util.Set;


@Service
@RequiredArgsConstructor
public class SurveyService implements CreateSurveyUseCase, ChangeVisibleUseCase, EditSurveyUseCase, GetAllSurveysUseCase, DeleteSurveyUseCase {

    private final SurveyRepository surveyRepository;

    @Override
    public CreateSurveyResult createSurvey(CreateSurveyCommand command) {

        Survey survey = Survey.create(command.title(), command.description());
        surveyRepository.save(survey);


        return new CreateSurveyResult(survey.getId().value(), survey.getCreatedAt());
    }

    @Override
    public ChangeVisibleResult changeVisible(ChangeVisibleCommand command) {
        SurveyId surveyId = new SurveyId(command.surveyId());
        Survey survey = surveyRepository.findById(surveyId).orElseThrow(() -> new SurveyException("Survey with id " + surveyId + " not found"));

        survey.changeVisibility(command.isVisable());

        Survey editedSurvey = surveyRepository.save(survey);

        return new ChangeVisibleResult(editedSurvey.getId().value(),
                editedSurvey.isVisible(),
                editedSurvey.getUpdatedAt());
    }

    @Override
    public EditSurveyResult editSurvey(EditSurveyCommand command) {
        SurveyId surveyId = new SurveyId(command.surveyId());
        Survey survey = surveyRepository.findById(surveyId).orElseThrow(() -> new SurveyException("Survey with id " + surveyId + " not found"));


        survey.editSurveyTitleAndDescription(command.title(), command.description());

        Survey editedSurvey = surveyRepository.save(survey);

        return new EditSurveyResult(editedSurvey.getId().value(),
                editedSurvey.getTitle(),
                editedSurvey.getDescription(),
                editedSurvey.getUpdatedAt());
    }

    @Override
    public GetAllActiveSurveysResult getAllActiveSurveys() {
        return new GetAllActiveSurveysResult(surveyRepository.findAllActiveSurveys());
    }

    @Override
    public GetAllSurveysResult getAllSurveys() {
        return new GetAllSurveysResult(surveyRepository.getAllSurveys());
    }

    @Override
    public void deleteSurvey(DeleteSurveyCommand command) {
        SurveyId surveyId = new SurveyId(command.surveyId());
        surveyRepository.findById(surveyId)
                .orElseThrow(() -> new SurveyException("Survey with id " + surveyId + " not found"));
        surveyRepository.deleteSurveyWithAllData(surveyId);
    }
}