package pl.ordovita.tasks.presentation.rest;

import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.tasks.application.port.in.CreateTaskStatusUseCase;
import pl.ordovita.tasks.application.port.in.DeleteTaskStatusUseCase;
import pl.ordovita.tasks.application.port.in.EditTaskStatusUseCase;
import pl.ordovita.tasks.application.port.in.GetTaskStatusesUseCase;
import pl.ordovita.tasks.presentation.dto.CreateTaskStatusRequest;
import pl.ordovita.tasks.presentation.dto.EditTaskStatusRequest;

import java.util.UUID;

@RestController
@RequestMapping("/v1/api/task-status")
@RequiredArgsConstructor
public class TaskStatusController {

    private final CreateTaskStatusUseCase createTaskStatusUseCase;
    private final EditTaskStatusUseCase editTaskStatusUseCase;
    private final DeleteTaskStatusUseCase deleteTaskStatusUseCase;
    private final GetTaskStatusesUseCase getTaskStatusesUseCase;

    @PostMapping
    public ResponseEntity<CreateTaskStatusUseCase.CreateTaskStatusResult> createTaskStatus(@Valid @RequestBody CreateTaskStatusRequest request) {
        CreateTaskStatusUseCase.CreateTaskStatusCommand command = new CreateTaskStatusUseCase.CreateTaskStatusCommand(request.name(), request.color());
        CreateTaskStatusUseCase.CreateTaskStatusResult result = createTaskStatusUseCase.createTaskStatus(command);

        return ResponseEntity.status(201).body(result);
    }

    @PutMapping("/{statusId}")
    public ResponseEntity<EditTaskStatusUseCase.EditTaskStatusResult> editTaskStatus(@NonNull @PathVariable UUID statusId,
                                                                                      @Valid @RequestBody EditTaskStatusRequest request) {
        EditTaskStatusUseCase.EditTaskStatusCommand command = new EditTaskStatusUseCase.EditTaskStatusCommand(statusId, request.name(), request.color());
        EditTaskStatusUseCase.EditTaskStatusResult result = editTaskStatusUseCase.editTaskStatus(command);

        return ResponseEntity.ok().body(result);
    }

    @DeleteMapping("/{statusId}")
    public ResponseEntity<Void> deleteTaskStatus(@NonNull @PathVariable UUID statusId) {
        DeleteTaskStatusUseCase.DeleteTaskStatusCommand command = new DeleteTaskStatusUseCase.DeleteTaskStatusCommand(statusId);
        deleteTaskStatusUseCase.deleteTaskStatus(command);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<GetTaskStatusesUseCase.GetAllTaskStatusesResult> getAllTaskStatuses() {
        return ResponseEntity.ok().body(getTaskStatusesUseCase.getAllTaskStatuses());
    }

    @GetMapping("/my")
    public ResponseEntity<GetTaskStatusesUseCase.GetUserTaskStatusesResult> getUserTaskStatuses() {
        return ResponseEntity.ok().body(getTaskStatusesUseCase.getUserTaskStatuses());
    }
}
