package pl.ordovita.tasks.application.port.in;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface GenerateAiPlanUseCase {

    record GenerateAiPlanCommand(String userText) {}

    record GeneratedTask(UUID taskId, String title, String description, String priority,
                         UUID categoryId, UUID statusId, int estimatedDuration, Instant dueDateTime) {}

    record GeneratedEvent(UUID eventId, String title, Instant startDateTime, Instant endDateTime,
                          boolean allDay) {}

    record GeneratedCategory(UUID categoryId, String name, String color) {}

    record GenerateAiPlanResult(List<GeneratedTask> tasks, List<GeneratedEvent> events,
                                List<GeneratedCategory> createdCategories) {}

    GenerateAiPlanResult generatePlan(GenerateAiPlanCommand command);
}
