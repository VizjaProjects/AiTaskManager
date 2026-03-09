package pl.ordovita.surveys.presentation.rest;

import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.surveys.application.port.in.ChangeVisibleUseCase;
import pl.ordovita.surveys.application.port.in.CreateSurveyUseCase;
import pl.ordovita.surveys.application.port.in.EditSurveyUseCase;
import pl.ordovita.surveys.application.port.in.GetAllSurveysUseCase;
import pl.ordovita.surveys.presentation.dto.survey.ChangeSurveyVisibleRequest;
import pl.ordovita.surveys.presentation.dto.survey.EditSurveyRequest;
import pl.ordovita.surveys.presentation.dto.survey.SurveyRequest;
import pl.ordovita.surveys.presentation.dto.survey.SurveyResponse;

import java.util.UUID;

@RestController
@RequestMapping("/v1/api/survey")
@RequiredArgsConstructor
public class SurveyController {

    private final CreateSurveyUseCase surveyUseCase;
    private final ChangeVisibleUseCase changeVisibleUseCase;
    private final EditSurveyUseCase editSurveyUseCase;
    private final GetAllSurveysUseCase getAllSurveysUseCase;

    @PostMapping("/createSurvey")
    public ResponseEntity<SurveyResponse> createSurvey(@Valid @RequestBody SurveyRequest surveyRequest) {

        CreateSurveyUseCase.CreateSurveyCommand command = new CreateSurveyUseCase.CreateSurveyCommand(surveyRequest.title(),surveyRequest.description());
        CreateSurveyUseCase.CreateSurveyResult result = surveyUseCase.createSurvey(command);

        return ResponseEntity.status(201).body(new SurveyResponse(result.surveyId(), result.createdAt()));
    }

    @PatchMapping("/changeVisible/{surveyId}")
    public ResponseEntity<ChangeVisibleUseCase.ChangeVisibleResult> changeSurveyVisible(@NonNull @PathVariable UUID surveyId, @Valid @RequestBody ChangeSurveyVisibleRequest changeSurveyVisibleRequest) {

        ChangeVisibleUseCase.ChangeVisibleCommand command = new ChangeVisibleUseCase.ChangeVisibleCommand(surveyId, changeSurveyVisibleRequest.isVisible());
        ChangeVisibleUseCase.ChangeVisibleResult result = changeVisibleUseCase.changeVisible(command);

        return ResponseEntity.ok().body(result);
    }

    @PutMapping("/edit/{surveyId}")
    public ResponseEntity<EditSurveyUseCase.EditSurveyResult> edit(@NonNull @PathVariable UUID surveyId, @Valid @RequestBody EditSurveyRequest editSurveyRequest) {

        EditSurveyUseCase.EditSurveyCommand command = new EditSurveyUseCase.EditSurveyCommand(surveyId, editSurveyRequest.title(), editSurveyRequest.description());
        EditSurveyUseCase.EditSurveyResult result = editSurveyUseCase.editSurvey(command);

        return ResponseEntity.ok().body(result);
    }

    @GetMapping("/allAcrive")
    ResponseEntity<GetAllSurveysUseCase.GetAllActiveSurveysResult> allActiveSurveys() {
        return ResponseEntity.ok().body(getAllSurveysUseCase.getAllActiveSurveys());
    }

    @GetMapping("/all")
    ResponseEntity<GetAllSurveysUseCase.GetAllSurveysResult> allSurveys() {
        return ResponseEntity.ok().body(getAllSurveysUseCase.getAllSurveys());
    }
}
