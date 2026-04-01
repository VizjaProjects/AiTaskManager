package pl.ordovita.tasks.application.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.shared.domain.ai.AiClient;
import pl.ordovita.shared.domain.ai.AiRequest;
import pl.ordovita.shared.domain.ai.AiResponse;
import pl.ordovita.shared.infrastructure.ai.AiClientException;
import pl.ordovita.surveys.application.dto.UserResponseResult;
import pl.ordovita.surveys.domain.port.SurveyRepository;
import pl.ordovita.tasks.application.port.in.CreateEventUseCase;
import pl.ordovita.tasks.application.port.in.CreateTaskUseCase;
import pl.ordovita.tasks.application.port.in.GenerateAiPlanUseCase;
import pl.ordovita.tasks.application.port.in.GetCategoriesUseCase;
import pl.ordovita.tasks.application.port.in.GetTaskStatusesUseCase;
import pl.ordovita.tasks.domain.exception.CalendarException;
import pl.ordovita.tasks.domain.model.calendar.Calendar;
import pl.ordovita.tasks.domain.model.category.CategoryId;
import pl.ordovita.tasks.domain.model.event.Event;
import pl.ordovita.tasks.domain.model.event.ProposedBy;
import pl.ordovita.tasks.domain.model.status.TaskStatusId;
import pl.ordovita.tasks.domain.model.task.Task;
import pl.ordovita.tasks.domain.model.task.TaskPriority;
import pl.ordovita.tasks.domain.model.task.TaskSource;
import pl.ordovita.tasks.domain.model.category.TaskCategory;
import pl.ordovita.tasks.domain.port.CalendarRepository;
import pl.ordovita.tasks.domain.port.CategoryRepository;
import pl.ordovita.tasks.domain.port.EventRepository;
import pl.ordovita.tasks.domain.port.TaskRepository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiPlanningService implements GenerateAiPlanUseCase {

    private final AiClient aiClient;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;
    private final SurveyRepository surveyRepository;
    private final GetCategoriesUseCase getCategoriesUseCase;
    private final GetTaskStatusesUseCase getTaskStatusesUseCase;
    private final TaskRepository taskRepository;
    private final EventRepository eventRepository;
    private final CalendarRepository calendarRepository;
    private final CategoryRepository categoryRepository;

    private static final ObjectMapper MAPPER = new ObjectMapper()
            .registerModule(new JavaTimeModule());

    @Override
    public GenerateAiPlanResult generatePlan(GenerateAiPlanCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));

        Set<UserResponseResult> surveyAnswers = surveyRepository.getAllUserResponseResults(user.getId());

        List<GetCategoriesUseCase.CategoryResult> categories =
                getCategoriesUseCase.getUserCategories().categories();


        List<GetTaskStatusesUseCase.TaskStatusResult> statuses =
                getTaskStatusesUseCase.getUserTaskStatuses().statuses();

        String prompt = AiPlanPromptBuilder.build(command.userText(), surveyAnswers, categories, statuses, command.zonedDateTime());

        log.info("Sending AI plan request for user {}", user.getId().value());
        AiResponse aiResponse = aiClient.ask(new AiRequest(prompt));

        log.info("Sending prompt to AI {}", prompt);

        AiPlanJson plan = parseResponse(aiResponse.content());

        Calendar calendar = calendarRepository.findByUserId(user.getId())
                .orElseThrow(() -> new CalendarException("Calendar not found for user"));

        Map<String, TaskCategory> createdCategoriesByName = new HashMap<>();
        List<GeneratedCategory> generatedCategories = new ArrayList<>();
        List<GeneratedTask> generatedTasks = new ArrayList<>();
        if (plan.tasks() != null) {
            for (AiTaskJson t : plan.tasks()) {
                CategoryId categoryId = resolveCategoryId(t, user, createdCategoriesByName, generatedCategories);
                TaskStatusId statusId = resolveStatusId(t.statusId(), statuses);

                Task task = Task.create(t.title(), t.description(),
                        parsePriority(t.priority()), categoryId,
                        t.estimatedDuration() != null ? t.estimatedDuration() : 30,
                        t.dueDateTime(), statusId, TaskSource.AI_PARSED, user.getId());

                Task saved = taskRepository.save(task);

                if (t.dueDateTime() != null) {
                    int duration = t.estimatedDuration() != null ? t.estimatedDuration() : 30;
                    Event event = Event.create(saved.getId(), saved.getTitle(), t.dueDateTime(),
                            t.dueDateTime().plusSeconds(duration * 60L), false, ProposedBy.AI, calendar.getId());
                    eventRepository.save(event);
                }

                generatedTasks.add(new GeneratedTask(saved.getId().value(), saved.getTitle(),
                        saved.getDescription(), saved.getPriority().name(),
                        categoryId != null ? categoryId.value() : null,
                        statusId.value(), saved.getEstimatedDuration(), saved.getDueDateTime()));
            }
        }

        List<GeneratedEvent> generatedEvents = new ArrayList<>();
        if (plan.events() != null) {
            for (AiEventJson e : plan.events()) {
                Event event = Event.create(null, e.title(), e.startDateTime(), e.endDateTime(),
                        e.allDay() != null && e.allDay(), ProposedBy.AI, calendar.getId());

                Event saved = eventRepository.save(event);

                generatedEvents.add(new GeneratedEvent(saved.getId().value(), saved.getTitle(),
                        saved.getStartDateTime(), saved.getEndDateTime(), saved.isAllDay()));
            }
        }

        log.info("AI plan generated: {} tasks, {} events, {} new categories",
                generatedTasks.size(), generatedEvents.size(), generatedCategories.size());
        return new GenerateAiPlanResult(generatedTasks, generatedEvents, generatedCategories);
    }

    private AiPlanJson parseResponse(String content) {
        String json = content.strip();
        if (json.startsWith("```")) {
            json = json.replaceFirst("```(?:json)?\\s*", "");
            json = json.replaceFirst("\\s*```$", "");
        }
        try {
            return MAPPER.readValue(json, AiPlanJson.class);
        } catch (JsonProcessingException e) {
            throw new AiClientException("Failed to parse AI response as JSON: " + e.getMessage(), e);
        }
    }

    private TaskPriority parsePriority(String priority) {
        if (priority == null) return TaskPriority.MEDIUM;
        try {
            return TaskPriority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            return TaskPriority.MEDIUM;
        }
    }

    private CategoryId resolveCategoryId(AiTaskJson t, User user,
                                          Map<String, TaskCategory> createdCategoriesByName,
                                          List<GeneratedCategory> generatedCategories) {
        if (t.categoryId() != null) {
            return new CategoryId(t.categoryId());
        }
        if (t.newCategoryName() != null && !t.newCategoryName().isBlank()) {
            String key = t.newCategoryName().strip().toLowerCase();
            TaskCategory existing = createdCategoriesByName.get(key);
            if (existing != null) {
                return existing.getId();
            }
            String color = t.newCategoryColor() != null ? t.newCategoryColor() : "#6366F1";
            TaskCategory category = TaskCategory.create(t.newCategoryName().strip(), color, user.getId());
            TaskCategory saved = categoryRepository.save(category);
            createdCategoriesByName.put(key, saved);
            generatedCategories.add(new GeneratedCategory(
                    saved.getId().value(), saved.getName(), saved.getColor()));
            return saved.getId();
        }
        return null;
    }

    private TaskStatusId resolveStatusId(UUID statusId, List<GetTaskStatusesUseCase.TaskStatusResult> statuses) {
        if (statusId != null) {
            return new TaskStatusId(statusId);
        }
        return statuses.stream()
                .filter(s -> s.name().equalsIgnoreCase("To Do"))
                .findFirst()
                .map(s -> new TaskStatusId(s.statusId()))
                .orElseGet(() -> new TaskStatusId(statuses.getFirst().statusId()));
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record AiPlanJson(List<AiTaskJson> tasks, List<AiEventJson> events) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record AiTaskJson(String title, String description, String priority, UUID categoryId,
                              UUID statusId, Integer estimatedDuration, Instant dueDateTime,
                              String newCategoryName, String newCategoryColor) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record AiEventJson(String title, Instant startDateTime, Instant endDateTime, Boolean allDay) {}
}
