package pl.ordovita.surveys.presentation.rest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pl.ordovita.surveys.application.port.in.CreateSurveyUseCase;
import pl.ordovita.surveys.presentation.dto.survey.SurveyRequest;
import pl.ordovita.surveys.presentation.dto.survey.SurveyResponse;

@RestController
@RequestMapping("/v1/api/survey")
@RequiredArgsConstructor
public class SurveyController {

    private final CreateSurveyUseCase surveyUseCase;

    @PostMapping()
    public ResponseEntity<SurveyResponse> createSurvey(@Valid @RequestBody SurveyRequest surveyRequest) {

        CreateSurveyUseCase.CreateSurveyCommand command = new CreateSurveyUseCase.CreateSurveyCommand(surveyRequest.title(),surveyRequest.description());
        CreateSurveyUseCase.CreateSurveyResult result = surveyUseCase.createSurvey(command);

        return ResponseEntity.status(201).body(new SurveyResponse(result.surveyId(), result.createdAt()));
    }
}
