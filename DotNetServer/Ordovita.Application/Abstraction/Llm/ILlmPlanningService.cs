using Ordovita.Domain.Common;

namespace Ordovita.Application.Abstraction.Llm;

public interface ILlmPlanningService
{
    Task<Result<GeneratedLlmPlanResult>> GeneratePlanAsync(
        GeneratedLlmPlanRequest request,
        CancellationToken cancellationToken);
}

public sealed record GeneratedLlmPlanRequest(
    Guid WorkspaceId,
    Guid UserId,
    string UserText,
    TimeZoneInfo TimeZone);

public sealed record GeneratedLlmPlanResult(
    IReadOnlyList<GeneratedTask> Tasks,
    IReadOnlyList<GeneratedEvent> Events,
    IReadOnlyList<GeneratedCategory> CreatedCategories);

public sealed record GeneratedTask(
    Guid TaskId,
    string Title,
    string? Description,
    string Priority,
    Guid? CategoryId,
    Guid StatusId,
    int EstimatedDuration,
    DateTime? DueDateTime);

public sealed record GeneratedEvent(
    Guid EventId,
    string Title,
    DateTime StartDateTime,
    DateTime EndDateTime,
    bool AllDay);

public sealed record GeneratedCategory(
    Guid CategoryId,
    string Name,
    string Color);