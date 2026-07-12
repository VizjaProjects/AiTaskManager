using Ordovita.Domain.Tasks;

namespace Ordovita.Application.Tasks;

public sealed record TaskStepDto(
    Guid StepId,
    Guid TaskId,
    string Title,
    int Position,
    bool Completed,
    Guid? AssignedUserId,
    Guid CreatedBy,
    TaskSource Source,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public sealed record CreateTaskStepInput(string Title, Guid? AssignedUserId);
