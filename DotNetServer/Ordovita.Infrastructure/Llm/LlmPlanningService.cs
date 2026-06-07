using Microsoft.Extensions.Logging;
using Ordovita.Application.Abstraction.Llm;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Surveys.GetUserAnswers;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Infrastructure.Llm;

public sealed class LlmPlanningService(
    IAiClient aiClient,
    IUserAnswerReader userAnswerReader,
    IWorkCalendarRepository calendarRepository,
    ITaskCategoryRepository taskCategoryRepository,
    IWorkTaskStatusRepository workTaskStatusRepository,
    IWorkTaskRepository taskRepository,
    ICalendarEventRepository eventRepository,
    IUnitOfWork uow,
    ILogger<LlmPlanningService> logger) : ILlmPlanningService
{
    private const int CategoryLimit = 20;
    private const int DefaultDurationMinutes = 30;
    private const string DefaultCategoryColor = "#6366F1";
    private const string DefaultStatusName = "To Do";

    private const int TitleMaxLength = 200;
    private const int DescriptionMaxLength = 2000;
    private const int CategoryNameMaxLength = 100;
    private const int ColorMaxLength = 20;

    public async Task<Result<GeneratedLlmPlanResult>> GeneratePlanAsync(
        GeneratedLlmPlanRequest request, CancellationToken ct)
    {
        var workspaceId = WorkspaceId.From(request.WorkspaceId);
        var userId = UserId.From(request.UserId);

        var calendar = await calendarRepository.GetPrimaryByWorkspaceIdAsync(workspaceId, ct);
        if (calendar is null)
            return Result.Failure<GeneratedLlmPlanResult>(CalendarExceptions.NotFound);

        var statuses = await workTaskStatusRepository.GetByWorkspaceIdAsync(workspaceId, ct);
        if (statuses.Count == 0)
            return Result.Failure<GeneratedLlmPlanResult>(LlmPlanningErrors.NoStatuses);

        var surveyAnswers = await userAnswerReader.GetByUserIdAsync(userId, ct);
        var categories = await taskCategoryRepository.GetByWorkspaceIdAsync(workspaceId, ct);

        var nowInUserZone = TimeZoneInfo.ConvertTime(DateTimeOffset.UtcNow, request.TimeZone);
        var prompt = LlmPlanPromptBuilder.Build(request.UserText, surveyAnswers, categories, statuses, nowInUserZone);

        var aiResponse = await aiClient.AskAsync(new AiRequest(prompt), request.LlmSettingId, request.CustomUrl, ct);
        if (aiResponse.IsFailure || aiResponse.Value is null)
            return Result.Failure<GeneratedLlmPlanResult>(aiResponse.Error);

        var plan = AiPlanResponseParser.Parse(aiResponse.Value.Content);
        if (plan is null)
            return Result.Failure<GeneratedLlmPlanResult>(LlmPlanningErrors.InvalidAiResponse);

        var context = new PlanBuildContext(workspaceId, userId, calendar.Id, categories);

        var generatedTasks = await BuildTasksAsync(plan, context, statuses, ct);
        var generatedEvents = await BuildStandaloneEventsAsync(plan, context, ct);

        await uow.SaveChangesAsync(ct);

        logger.LogInformation(
            "AI plan generated for workspace {WorkspaceId}: {Tasks} tasks, {Events} events, {Categories} new categories",
            workspaceId.Value, generatedTasks.Count, generatedEvents.Count, context.CreatedCategories.Count);

        return Result.Success(new GeneratedLlmPlanResult(generatedTasks, generatedEvents, context.CreatedCategories));
    }

    private async Task<IReadOnlyList<GeneratedTask>> BuildTasksAsync(
        AiPlanJson plan, PlanBuildContext context, IReadOnlyList<WorkTaskStatus> statuses, CancellationToken ct)
    {
        var generated = new List<GeneratedTask>();
        if (plan.Tasks is null)
            return generated;

        foreach (var t in plan.Tasks)
        {
            if (string.IsNullOrWhiteSpace(t.Title))
            {
                logger.LogWarning("Skipping AI task without a title.");
                continue;
            }

            var categoryId = await ResolveCategoryIdAsync(t, context, ct);
            var statusId = ResolveStatusId(t.StatusId, statuses);
            var duration = t.EstimatedDuration is > 0 ? t.EstimatedDuration.Value : DefaultDurationMinutes;
            var dueDateTime = t.DueDateTime is { } due ? AiPlanMapper.ToUtc(due) : (DateTime?)null;

            var taskResult = WorkTask.Create(
                context.WorkspaceId,
                context.UserId,
                AiPlanMapper.Clamp(t.Title.Trim(), TitleMaxLength),
                Normalize(t.Description, DescriptionMaxLength),
                AiPlanMapper.ParsePriority(t.Priority),
                categoryId,
                duration,
                dueDateTime,
                statusId,
                TaskSource.AI_PARSED);

            if (taskResult.IsFailure || taskResult.Value is null)
            {
                logger.LogWarning("Skipping invalid AI task '{Title}': {Error}", t.Title, taskResult.Error.Code);
                continue;
            }

            var task = taskResult.Value;
            await taskRepository.AddAsync(task, ct);

            if (dueDateTime is { } start)
            {
                var eventResult = CalendarEvent.Create(
                    task.Id, task.Title, start, start.AddMinutes(duration), false, ProposedBy.AI, context.CalendarId);

                if (eventResult is { IsSuccess: true, Value: not null })
                    await eventRepository.AddAsync(eventResult.Value, ct);
            }

            generated.Add(new GeneratedTask(
                task.Id.Value, task.Title, task.Description, task.Priority.ToString(),
                task.CategoryId?.Value, task.StatusId.Value, task.EstimatedDuration, task.DueDateTime));
        }

        return generated;
    }

    private async Task<IReadOnlyList<GeneratedEvent>> BuildStandaloneEventsAsync(
        AiPlanJson plan, PlanBuildContext context, CancellationToken ct)
    {
        var generated = new List<GeneratedEvent>();
        if (plan.Events is null)
            return generated;

        foreach (var e in plan.Events)
        {
            if (string.IsNullOrWhiteSpace(e.Title) || e.StartDateTime is null || e.EndDateTime is null)
            {
                logger.LogWarning("Skipping incomplete AI event '{Title}'.", e.Title);
                continue;
            }

            var start = AiPlanMapper.ToUtc(e.StartDateTime.Value);
            var end = AiPlanMapper.ToUtc(e.EndDateTime.Value);

            var eventResult = CalendarEvent.Create(
                null, e.Title.Trim(), start, end, e.AllDay ?? false, ProposedBy.AI, context.CalendarId);

            if (eventResult.IsFailure || eventResult.Value is null)
            {
                logger.LogWarning("Skipping invalid AI event '{Title}': {Error}", e.Title, eventResult.Error.Code);
                continue;
            }

            var calendarEvent = eventResult.Value;
            await eventRepository.AddAsync(calendarEvent, ct);

            generated.Add(new GeneratedEvent(
                calendarEvent.Id.Value, calendarEvent.Title, calendarEvent.StartDateTime,
                calendarEvent.EndDateTime, calendarEvent.AllDay));
        }

        return generated;
    }

    private async Task<TaskCategoryId?> ResolveCategoryIdAsync(
        AiTaskJson task, PlanBuildContext context, CancellationToken ct)
    {
        if (task.CategoryId is { } existingId && context.IsKnownCategory(existingId))
            return TaskCategoryId.From(existingId);

        if (string.IsNullOrWhiteSpace(task.NewCategoryName))
            return null;

        var key = task.NewCategoryName.Trim().ToLowerInvariant();
        if (context.TryGetCreatedCategory(key, out var alreadyCreated))
            return alreadyCreated.Id;

        if (context.CategoryCount >= CategoryLimit)
        {
            logger.LogWarning("Category limit of {Limit} reached; '{Name}' will not be created.",
                CategoryLimit, task.NewCategoryName);
            return null;
        }

        var color = string.IsNullOrWhiteSpace(task.NewCategoryColor)
            ? DefaultCategoryColor
            : task.NewCategoryColor.Trim();

        var categoryResult =
            TaskCategory.Create(context.WorkspaceId, context.UserId, task.NewCategoryName.Trim(), color);
        if (categoryResult.IsFailure || categoryResult.Value is null)
        {
            logger.LogWarning("Skipping invalid AI category '{Name}': {Error}",
                task.NewCategoryName, categoryResult.Error.Code);
            return null;
        }

        var category = categoryResult.Value;
        await taskCategoryRepository.AddAsync(category, ct);
        context.RegisterCreatedCategory(key, category);
        return category.Id;
    }

    private static TaskStatusId ResolveStatusId(Guid? statusId, IReadOnlyList<WorkTaskStatus> statuses)
    {
        if (statusId is { } id && statuses.Any(s => s.Id.Value == id))
            return TaskStatusId.From(id);

        var fallback = statuses.FirstOrDefault(s =>
                           string.Equals(s.Name, DefaultStatusName, StringComparison.OrdinalIgnoreCase))
                       ?? statuses[0];

        return fallback.Id;
    }

    private static string? Normalize(string? value, int maxLength)
    {
        return string.IsNullOrWhiteSpace(value) ? null : AiPlanMapper.Clamp(value.Trim(), maxLength);
    }

    private sealed class PlanBuildContext
    {
        private readonly HashSet<Guid> _existingCategoryIds;
        private readonly Dictionary<string, TaskCategory> _createdCategoriesByName = new();
        private readonly List<GeneratedCategory> _createdCategories = new();

        public PlanBuildContext(
            WorkspaceId workspaceId, UserId userId, CalendarId calendarId,
            IReadOnlyList<TaskCategory> existingCategories)
        {
            WorkspaceId = workspaceId;
            UserId = userId;
            CalendarId = calendarId;
            _existingCategoryIds = existingCategories.Select(c => c.Id.Value).ToHashSet();
            CategoryCount = existingCategories.Count;
        }

        public WorkspaceId WorkspaceId { get; }
        public UserId UserId { get; }
        public CalendarId CalendarId { get; }
        public int CategoryCount { get; private set; }
        public IReadOnlyList<GeneratedCategory> CreatedCategories => _createdCategories;

        public bool IsKnownCategory(Guid categoryId)
        {
            return _existingCategoryIds.Contains(categoryId);
        }

        public bool TryGetCreatedCategory(string key, out TaskCategory category)
        {
            return _createdCategoriesByName.TryGetValue(key, out category!);
        }

        public void RegisterCreatedCategory(string key, TaskCategory category)
        {
            _createdCategoriesByName[key] = category;
            _createdCategories.Add(new GeneratedCategory(category.Id.Value, category.Name, category.Color));
            _existingCategoryIds.Add(category.Id.Value);
            CategoryCount++;
        }
    }
}