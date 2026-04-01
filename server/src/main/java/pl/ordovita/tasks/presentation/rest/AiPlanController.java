package pl.ordovita.tasks.presentation.rest;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.tasks.application.port.in.GenerateAiPlanUseCase;
import pl.ordovita.tasks.presentation.dto.GenerateAiPlanRequest;

import java.time.ZoneId;
import java.time.ZonedDateTime;

@RestController
@RequestMapping("/v1/api/ai")
@RequiredArgsConstructor
public class AiPlanController {

    private final GenerateAiPlanUseCase generateAiPlanUseCase;

    @PostMapping("/plan")
    public ResponseEntity<GenerateAiPlanUseCase.@NonNull GenerateAiPlanResult> generatePlan(
            @Valid @RequestBody GenerateAiPlanRequest request, HttpServletRequest servletRequest) {

        String timeZoneHeader = servletRequest.getHeader("X-Time-Zone");
        ZoneId zoneId = ZoneId.of(timeZoneHeader);
        ZonedDateTime userNow = ZonedDateTime.now(zoneId);


        GenerateAiPlanUseCase.GenerateAiPlanCommand command =
                new GenerateAiPlanUseCase.GenerateAiPlanCommand(request.text(), userNow);

        GenerateAiPlanUseCase.GenerateAiPlanResult result = generateAiPlanUseCase.generatePlan(command);

        return ResponseEntity.status(201).body(result);
    }
}
