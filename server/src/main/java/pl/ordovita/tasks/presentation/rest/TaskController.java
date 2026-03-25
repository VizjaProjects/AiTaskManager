package pl.ordovita.tasks.presentation.rest;

import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.tasks.application.port.in.CreateTaskUseCase;
import pl.ordovita.tasks.application.port.in.DeleteTaskUseCase;
import pl.ordovita.tasks.application.port.in.EditTaskUseCase;
import pl.ordovita.tasks.application.port.in.GetAllUserTasksUseCase;
import pl.ordovita.tasks.presentation.dto.CreateTaskRequest;
import pl.ordovita.tasks.presentation.dto.CreateTaskResponse;
import pl.ordovita.tasks.presentation.dto.EditTaskRequest;

import java.util.UUID;

@RestController
@RequestMapping("/v1/api/task")
@RequiredArgsConstructor
public class TaskController {

    private final CreateTaskUseCase createTaskUseCase;
    private final EditTaskUseCase editTaskUseCase;
    private final DeleteTaskUseCase deleteTaskUseCase;
    private final GetAllUserTasksUseCase getAllUserTasksUseCase;

    @PostMapping
    public ResponseEntity<CreateTaskResponse> createTask(@Valid @RequestBody CreateTaskRequest request) {
        CreateTaskUseCase.CreateTaskCommand command = new CreateTaskUseCase.CreateTaskCommand(
                request.title(), request.description(), request.priority(), request.categoryId(),
                request.estimatedDuration(), request.dueDateTime(), request.statusId(), request.source());

        CreateTaskUseCase.CreateTaskResult result = createTaskUseCase.createTask(command);

        return ResponseEntity.status(201).body(new CreateTaskResponse(result.taskId(), result.createdAt()));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<EditTaskUseCase.EditTaskResult> editTask(@NonNull @PathVariable UUID taskId,
                                                                    @Valid @RequestBody EditTaskRequest request) {
        EditTaskUseCase.EditTaskCommand command = new EditTaskUseCase.EditTaskCommand(
                taskId, request.title(), request.description(), request.priority(), request.categoryId(),
                request.estimatedDuration(), request.dueDateTime(), request.statusId());

        EditTaskUseCase.EditTaskResult result = editTaskUseCase.editTask(command);

        return ResponseEntity.ok().body(result);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@NonNull @PathVariable UUID taskId) {
        DeleteTaskUseCase.DeleteTaskCommand command = new DeleteTaskUseCase.DeleteTaskCommand(taskId);
        deleteTaskUseCase.deleteTask(command);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<GetAllUserTasksUseCase.GetAllUserTasksResult> getAllUserTasks() {
        return ResponseEntity.ok().body(getAllUserTasksUseCase.getAllUserTasks());
    }
}
