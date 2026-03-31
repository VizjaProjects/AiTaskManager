package pl.ordovita.tasks.presentation.rest;

import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.tasks.application.port.in.AcceptAiEventUseCase;
import pl.ordovita.tasks.application.port.in.AcceptAiTaskUseCase;
import pl.ordovita.tasks.application.port.in.GetPendingAiProposalsUseCase;
import pl.ordovita.tasks.application.port.in.RejectAiEventUseCase;
import pl.ordovita.tasks.application.port.in.RejectAiTaskUseCase;
import pl.ordovita.tasks.presentation.dto.AcceptAiEventRequest;
import pl.ordovita.tasks.presentation.dto.AcceptAiTaskRequest;

import java.util.UUID;

@RestController
@RequestMapping("/v1/api/ai/proposals")
@RequiredArgsConstructor
public class AiProposalController {

    private final GetPendingAiProposalsUseCase getPendingAiProposalsUseCase;
    private final AcceptAiTaskUseCase acceptAiTaskUseCase;
    private final RejectAiTaskUseCase rejectAiTaskUseCase;
    private final AcceptAiEventUseCase acceptAiEventUseCase;
    private final RejectAiEventUseCase rejectAiEventUseCase;

    @GetMapping
    public ResponseEntity<GetPendingAiProposalsUseCase.GetPendingAiProposalsResult> getPendingProposals() {
        return ResponseEntity.ok(getPendingAiProposalsUseCase.getPendingProposals());
    }

    @PostMapping("/tasks/{taskId}/accept")
    public ResponseEntity<AcceptAiTaskUseCase.AcceptAiTaskResult> acceptTask(
            @NonNull @PathVariable UUID taskId,
            @Valid @RequestBody AcceptAiTaskRequest request) {

        AcceptAiTaskUseCase.AcceptAiTaskCommand command = new AcceptAiTaskUseCase.AcceptAiTaskCommand(
                taskId, request.title(), request.description(), request.priority(),
                request.categoryId(), request.estimatedDuration(), request.dueDateTime(), request.statusId());

        return ResponseEntity.ok(acceptAiTaskUseCase.acceptTask(command));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> rejectTask(@NonNull @PathVariable UUID taskId) {
        rejectAiTaskUseCase.rejectTask(new RejectAiTaskUseCase.RejectAiTaskCommand(taskId));
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/events/{eventId}/accept")
    public ResponseEntity<AcceptAiEventUseCase.AcceptAiEventResult> acceptEvent(
            @NonNull @PathVariable UUID eventId,
            @Valid @RequestBody AcceptAiEventRequest request) {

        AcceptAiEventUseCase.AcceptAiEventCommand command = new AcceptAiEventUseCase.AcceptAiEventCommand(
                eventId, request.title(), request.startDateTime(), request.endDateTime(),
                request.allDay(), request.status());

        return ResponseEntity.ok(acceptAiEventUseCase.acceptEvent(command));
    }

    @DeleteMapping("/events/{eventId}")
    public ResponseEntity<Void> rejectEvent(@NonNull @PathVariable UUID eventId) {
        rejectAiEventUseCase.rejectEvent(new RejectAiEventUseCase.RejectAiEventCommand(eventId));
        return ResponseEntity.noContent().build();
    }
}
