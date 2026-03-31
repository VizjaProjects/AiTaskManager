package pl.ordovita.tasks.application.port.in;

import pl.ordovita.tasks.domain.model.event.ProposedBy;
import pl.ordovita.tasks.domain.model.task.TaskPriority;
import pl.ordovita.tasks.domain.model.task.TaskSource;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface GetPendingAiProposalsUseCase {

    record PendingTask(UUID taskId, String title, String description, TaskPriority priority, UUID categoryId,
                       int estimatedDuration, Instant dueDateTime, UUID statusId, TaskSource source,
                       Instant createdAt) {}

    record PendingEvent(UUID eventId, UUID taskId, String title, Instant startDateTime, Instant endDateTime,
                        boolean allDay, ProposedBy proposedBy, Instant createdAt) {}

    record GetPendingAiProposalsResult(List<PendingTask> tasks, List<PendingEvent> events) {}

    GetPendingAiProposalsResult getPendingProposals();
}
