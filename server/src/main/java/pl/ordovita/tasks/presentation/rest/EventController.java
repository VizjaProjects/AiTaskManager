package pl.ordovita.tasks.presentation.rest;

import jakarta.validation.Valid;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pl.ordovita.tasks.application.port.in.CreateEventUseCase;
import pl.ordovita.tasks.application.port.in.DeleteEventUseCase;
import pl.ordovita.tasks.application.port.in.EditEventUseCase;
import pl.ordovita.tasks.application.port.in.GetUserEventsUseCase;
import pl.ordovita.tasks.presentation.dto.CreateEventRequest;
import pl.ordovita.tasks.presentation.dto.EditEventRequest;

import java.util.UUID;

@RestController
@RequestMapping("/v1/api/event")
@RequiredArgsConstructor
public class EventController {

    private final CreateEventUseCase createEventUseCase;
    private final EditEventUseCase editEventUseCase;
    private final DeleteEventUseCase deleteEventUseCase;
    private final GetUserEventsUseCase getUserEventsUseCase;

    @PostMapping
    public ResponseEntity<CreateEventUseCase.CreateEventResult> createEvent(@Valid @RequestBody CreateEventRequest request) {
        CreateEventUseCase.CreateEventCommand command = new CreateEventUseCase.CreateEventCommand(
                request.taskId(), request.title(), request.startDateTime(), request.endDateTime(),
                request.allDay(), request.proposedBy());

        CreateEventUseCase.CreateEventResult result = createEventUseCase.createEvent(command);

        return ResponseEntity.status(201).body(result);
    }

    @PutMapping("/{eventId}")
    public ResponseEntity<EditEventUseCase.EditEventResult> editEvent(@NonNull @PathVariable UUID eventId,
                                                                       @Valid @RequestBody EditEventRequest request) {
        EditEventUseCase.EditEventCommand command = new EditEventUseCase.EditEventCommand(
                eventId, request.title(), request.startDateTime(), request.endDateTime(),
                request.allDay(), request.status());

        EditEventUseCase.EditEventResult result = editEventUseCase.editEvent(command);

        return ResponseEntity.ok().body(result);
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@NonNull @PathVariable UUID eventId) {
        DeleteEventUseCase.DeleteEventCommand command = new DeleteEventUseCase.DeleteEventCommand(eventId);
        deleteEventUseCase.deleteEvent(command);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<GetUserEventsUseCase.GetUserEventsResult> getUserEvents() {
        return ResponseEntity.ok().body(getUserEventsUseCase.getUserEvents());
    }
}
