package pl.ordovita.surveys.presentation.rest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.surveys.application.port.in.CreateQuestionSurveyUseCase;
import pl.ordovita.surveys.presentation.dto.question.QuestionRequest;
import pl.ordovita.surveys.presentation.dto.question.QuestionResponse;

import java.util.UUID;

@RestController
@RequestMapping("/v1/api/question")
@RequiredArgsConstructor
public class QuestionController {

    private final CreateQuestionSurveyUseCase questionSurveyUseCase;


    @PostMapping("/{surveyId}")
    public ResponseEntity<QuestionResponse> create(@Valid @RequestBody QuestionRequest request, @PathVariable UUID surveyId) {

        CreateQuestionSurveyUseCase.CreateQuestionSurveyCommand command = new  CreateQuestionSurveyUseCase.CreateQuestionSurveyCommand(request.questionText(),surveyId,request.questionType(),request.optionTextValue(),request.isRequired());
        CreateQuestionSurveyUseCase.CreateQuestionSurveyResult  result = questionSurveyUseCase.create(command);

        return ResponseEntity.status(201).body(new QuestionResponse(result.questionId(),result.surveyId(),result.createdAt()));
    }

}
