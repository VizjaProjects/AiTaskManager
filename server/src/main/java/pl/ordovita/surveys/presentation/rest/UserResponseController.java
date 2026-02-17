package pl.ordovita.surveys.presentation.rest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.surveys.application.port.in.AddResponseToSurveyUseCase;
import pl.ordovita.surveys.presentation.dto.userResponse.UserAnswerResponse;
import pl.ordovita.surveys.presentation.dto.userResponse.UserResponseRequest;

import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/api/user-response")
@RequiredArgsConstructor
public class UserResponseController {

    private final AddResponseToSurveyUseCase addResponseToSurveyUseCase;


    @PostMapping("/{surveyId}")
    public ResponseEntity<UserAnswerResponse> create(@PathVariable UUID surveyId, @Valid @RequestBody UserResponseRequest request) {

        AddResponseToSurveyUseCase.AddResponseCommand command = new AddResponseToSurveyUseCase.AddResponseCommand(
                surveyId,
                request.answerSet());
        AddResponseToSurveyUseCase.AddResponseResult result = addResponseToSurveyUseCase.addResponse(command);

        return ResponseEntity.status(201).body(new UserAnswerResponse(result.answerSet(), result.surveyId(), result.createdAt()));
    }
}
