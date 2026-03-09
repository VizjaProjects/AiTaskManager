package pl.ordovita.surveys.presentation.rest;

import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.surveys.application.dto.QuestionOptionsResult;
import pl.ordovita.surveys.application.dto.QuestionsResult;
import pl.ordovita.surveys.application.port.in.*;
import pl.ordovita.surveys.presentation.dto.question.EditQuestionRequest;
import pl.ordovita.surveys.presentation.dto.question.QuestionRequest;
import pl.ordovita.surveys.presentation.dto.question.QuestionResponse;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/v1/api/question")
@RequiredArgsConstructor
public class QuestionController {

    private final CreateQuestionSurveyUseCase questionSurveyUseCase;
    private final GetAllSurveyQuestionsUseCase  getAllSurveyQuestionsUseCase;
    private final GetQuestionOptionsUseCase getQuestionOptionsUseCase;
    private final EditQuestionUseCase editQuestionUseCase;
    private final DeleteQuestionUseCase deleteQuestionUseCase;


    @PostMapping("/{surveyId}")
    public ResponseEntity<QuestionResponse> create(@Valid @RequestBody QuestionRequest request, @PathVariable UUID surveyId) {

        CreateQuestionSurveyUseCase.CreateQuestionSurveyCommand command = new  CreateQuestionSurveyUseCase.CreateQuestionSurveyCommand(request.questionText(),surveyId,request.questionType(),request.optionTextValue(),request.isRequired());
        CreateQuestionSurveyUseCase.CreateQuestionSurveyResult  result = questionSurveyUseCase.create(command);

        return ResponseEntity.status(201).body(new QuestionResponse(result.questionId(),result.surveyId(),result.createdAt()));
    }

    @GetMapping("/allSurveyQuestion/{surveyId}")
    public ResponseEntity<Set<QuestionsResult>> allSurveyQuestion(@NonNull @PathVariable UUID surveyId) {

        GetAllSurveyQuestionsUseCase.GetAllSurveyQuestionsCommand command = new GetAllSurveyQuestionsUseCase.GetAllSurveyQuestionsCommand(surveyId);
        GetAllSurveyQuestionsUseCase.GetAllSurveyQuestionsResult result = getAllSurveyQuestionsUseCase.getQuestions(command);

        return ResponseEntity.ok().body(result.questionsRespons());
    }

    @GetMapping("/questionOptions/{questionId}")
    public ResponseEntity<List<QuestionOptionsResult>> questionOptions(@NonNull @PathVariable UUID questionId) {

        GetQuestionOptionsUseCase.GetQuestionOptionsCommand command = new GetQuestionOptionsUseCase.GetQuestionOptionsCommand(questionId);
        GetQuestionOptionsUseCase.GetQuestionOptionsResult result = getQuestionOptionsUseCase.getQuestionOptions(command);

        return ResponseEntity.ok().body(result.questionsRespons());
    }

    @PutMapping("/edit/{questionId}")
    public ResponseEntity<EditQuestionUseCase.EditQuestionResult> editQuestion(@PathVariable UUID questionId, @Valid @RequestBody EditQuestionRequest request) {
        EditQuestionUseCase.EditQuestionCommand command = new EditQuestionUseCase.EditQuestionCommand(questionId,request.questionText(),request.questionType(),request.isRequired());
        EditQuestionUseCase.EditQuestionResult result = editQuestionUseCase.edit(command);

        return ResponseEntity.status(201).body(result);
    }

    @PatchMapping("/deleteQuestion/{questionId}")
    public ResponseEntity<DeleteQuestionUseCase.DeleteQuestionResult> deleteQuestion(@PathVariable UUID questionId) {

        DeleteQuestionUseCase.DeleteQuestionCommand command = new DeleteQuestionUseCase.DeleteQuestionCommand(questionId);
        DeleteQuestionUseCase.DeleteQuestionResult result = deleteQuestionUseCase.deleteQuestion(command);

        return ResponseEntity.ok().body(result);
    }
}
