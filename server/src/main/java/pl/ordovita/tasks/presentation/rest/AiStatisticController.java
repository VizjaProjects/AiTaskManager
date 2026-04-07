package pl.ordovita.tasks.presentation.rest;

import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.tasks.application.port.in.CreateAiStatisticUseCase;
import pl.ordovita.tasks.application.port.in.DeleteAiStatisticUseCase;
import pl.ordovita.tasks.application.port.in.GetAiStatisticsUseCase;
import pl.ordovita.tasks.presentation.dto.CreateAiStatisticRequest;

import java.util.UUID;

@RestController
@RequestMapping("/v1/api/ai-statistic")
@RequiredArgsConstructor
public class AiStatisticController {

    private final CreateAiStatisticUseCase createAiStatisticUseCase;
    private final GetAiStatisticsUseCase getAiStatisticsUseCase;
    private final DeleteAiStatisticUseCase deleteAiStatisticUseCase;

    @PostMapping
    public ResponseEntity<CreateAiStatisticUseCase.CreateAiStatisticResult> createAiStatistic(
            @Valid @RequestBody CreateAiStatisticRequest request) {
        var command = new CreateAiStatisticUseCase.CreateAiStatisticCommand(
                request.promptText(), request.inputTokens());
        var result = createAiStatisticUseCase.createAiStatistic(command);
        return ResponseEntity.status(201).body(result);
    }

    @GetMapping("/my")
    public ResponseEntity<GetAiStatisticsUseCase.GetUserAiStatisticsResult> getUserAiStatistics() {
        return ResponseEntity.ok().body(getAiStatisticsUseCase.getUserAiStatistics());
    }

    @DeleteMapping("/{aiStatisticId}")
    public ResponseEntity<Void> deleteAiStatistic(@NonNull @PathVariable UUID aiStatisticId) {
        deleteAiStatisticUseCase.deleteAiStatistic(
                new DeleteAiStatisticUseCase.DeleteAiStatisticCommand(aiStatisticId));
        return ResponseEntity.noContent().build();
    }
}
