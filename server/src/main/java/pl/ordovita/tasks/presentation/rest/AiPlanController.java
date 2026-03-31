package pl.ordovita.tasks.presentation.rest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.tasks.application.port.in.GenerateAiPlanUseCase;
import pl.ordovita.tasks.presentation.dto.GenerateAiPlanRequest;

@RestController
@RequestMapping("/v1/api/ai")
@RequiredArgsConstructor
public class AiPlanController {

    private final GenerateAiPlanUseCase generateAiPlanUseCase;

    @PostMapping("/plan")
    public ResponseEntity<GenerateAiPlanUseCase.GenerateAiPlanResult> generatePlan(
            @Valid @RequestBody GenerateAiPlanRequest request) {

        GenerateAiPlanUseCase.GenerateAiPlanCommand command =
                new GenerateAiPlanUseCase.GenerateAiPlanCommand(request.text());

        GenerateAiPlanUseCase.GenerateAiPlanResult result = generateAiPlanUseCase.generatePlan(command);

        return ResponseEntity.status(201).body(result);
    }
}
