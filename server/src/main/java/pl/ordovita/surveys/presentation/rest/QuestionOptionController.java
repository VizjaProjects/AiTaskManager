package pl.ordovita.surveys.presentation.rest;

import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.surveys.application.port.in.DeleteQuestionOptionUseCase;
import pl.ordovita.surveys.application.port.in.EditQuestionOptionUseCase;
import pl.ordovita.surveys.presentation.dto.questionOption.EditQuestionOptionRequest;

import java.util.UUID;

@RestController
@RequestMapping("/v1/api/questionOption")
@RequiredArgsConstructor
public class QuestionOptionController {

    private final EditQuestionOptionUseCase editQuestionOptionUseCase;
    private final DeleteQuestionOptionUseCase deleteQuestionOptionUseCase;


    @PatchMapping("/delete/{questionOptionId}")
    public ResponseEntity<DeleteQuestionOptionUseCase.@NonNull DeleteQuestionOptionResult> deleteQuestionOption(@PathVariable UUID questionOptionId) {
        DeleteQuestionOptionUseCase.DeleteQuestionOptionCommand command = new DeleteQuestionOptionUseCase.DeleteQuestionOptionCommand(questionOptionId);
        DeleteQuestionOptionUseCase.DeleteQuestionOptionResult result = deleteQuestionOptionUseCase.delete(command);

        return ResponseEntity.ok().body(result);
    };


    @PutMapping("/edit/{questionOptionId}")
    public ResponseEntity<EditQuestionOptionUseCase.@NonNull EditQuestionOptionResult> edit(@PathVariable UUID questionOptionId, @Valid @RequestBody EditQuestionOptionRequest request) {

        EditQuestionOptionUseCase.EditQuestionOptionCommand command = new EditQuestionOptionUseCase.EditQuestionOptionCommand(questionOptionId, request.optionText());
        EditQuestionOptionUseCase.EditQuestionOptionResult result = editQuestionOptionUseCase.edit(command);

        return ResponseEntity.ok().body(result);
    }
}
