package pl.ordovita.surveys.presentation.rest;

import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.surveys.application.dto.UserResponseResult;
import pl.ordovita.surveys.application.port.in.AddResponseToSurveyUseCase;
import pl.ordovita.surveys.application.port.in.ChangeUserResponseUseCase;
import pl.ordovita.surveys.application.port.in.DeleteUserResponseUseCase;
import pl.ordovita.surveys.application.port.in.GetAllUserResponseUseCase;
import pl.ordovita.surveys.presentation.dto.userResponse.ChangeUserResponseRequest;
import pl.ordovita.surveys.presentation.dto.userResponse.UserAnswerResponse;
import pl.ordovita.surveys.presentation.dto.userResponse.UserResponseRequest;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/api/user-response")
@RequiredArgsConstructor
public class UserResponseController {

    private final AddResponseToSurveyUseCase addResponseToSurveyUseCase;
    private final ChangeUserResponseUseCase changeUserResponseUseCase;
    private final DeleteUserResponseUseCase deleteUserResponseUseCase;
    private final GetAllUserResponseUseCase getAllUserResponseUseCase;


    @PostMapping("/{surveyId}")
    public ResponseEntity<@NonNull UserAnswerResponse> create(@PathVariable UUID surveyId, @Valid @RequestBody UserResponseRequest request) {

        AddResponseToSurveyUseCase.AddResponseCommand command = new AddResponseToSurveyUseCase.AddResponseCommand(
                surveyId,
                request.questionId(),
                request.answer());
        AddResponseToSurveyUseCase.AddResponseResult result = addResponseToSurveyUseCase.addResponse(command);

        return ResponseEntity.status(201).body(new UserAnswerResponse(result.questionId(),result.answer(), result.surveyId(), result.createdAt()));
    }

    @PutMapping("/change/{userResponseId}")
    public ResponseEntity<ChangeUserResponseUseCase.@NonNull ChangeUserResponseResult> update(@PathVariable UUID userResponseId, @Valid @RequestBody ChangeUserResponseRequest request) {

        ChangeUserResponseUseCase.ChangeUserResponseCommand command = new ChangeUserResponseUseCase.ChangeUserResponseCommand(userResponseId,request.newAnswer());
        ChangeUserResponseUseCase.ChangeUserResponseResult result =  changeUserResponseUseCase.changeUserResponse(command);

        return ResponseEntity.ok().body(result);
    }


    @DeleteMapping("/delete/{userResponseId}")
    public ResponseEntity<@NonNull Void> delete(@PathVariable UUID userResponseId) {

        DeleteUserResponseUseCase.DeleteUserResponseCommand command = new DeleteUserResponseUseCase.DeleteUserResponseCommand(userResponseId);
        deleteUserResponseUseCase.deleteUserResponse(command);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/getAllUserResponse")
    public ResponseEntity<GetAllUserResponseUseCase.@NonNull GetAllUserResponseResult> getAllUserResponse() {

        GetAllUserResponseUseCase.GetAllUserResponseResult result = getAllUserResponseUseCase.getAllUserResponse();
        return ResponseEntity.ok().body(result);
    }

}
