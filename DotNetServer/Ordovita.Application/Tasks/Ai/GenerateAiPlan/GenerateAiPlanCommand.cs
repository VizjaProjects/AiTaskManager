using FluentValidation;
using Ordovita.Application.Abstraction.Llm;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Plan;
using Ordovita.Domain.Common;
using Action = Ordovita.Application.Plan.Action;

namespace Ordovita.Application.Tasks.Ai.GenerateAiPlan;

public sealed record GenerateAiPlanCommand(
    Guid? LlmSettingId,
    Guid WorkspaceId,
    string UserText,
    string? TimeZoneId) : ICommand<GeneratedLlmPlanResult>;

public sealed class GenerateAiPlanHandler(
    WorkspaceAccessGuard accessGuard,
    PlanLimitChecker planLimitChecker,
    ILlmPlanningService planningService)
    : ICommandHandler<GenerateAiPlanCommand, GeneratedLlmPlanResult>
{
    public async Task<Result<GeneratedLlmPlanResult>> Handle(GenerateAiPlanCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<GeneratedLlmPlanResult>(access.Error);
        
        var limitCheckResult = await planLimitChecker.Check(Action.PlanAiTask, ct);

        if (limitCheckResult.IsFailure || !limitCheckResult.Value)
        {
            return Result.Failure<GeneratedLlmPlanResult>(
                Error.LimitExceeded("AiTask.PlanLimitExceeded", "AI task creation limit exceeded for your current plan."));
        }
        var request = new GeneratedLlmPlanRequest(
            command.LlmSettingId,
            command.WorkspaceId,
            access.Value.User.Id.Value,
            command.UserText,
            ResolveTimeZone(command.TimeZoneId));

        return await planningService.GeneratePlanAsync(request, ct);
    }

    private static TimeZoneInfo ResolveTimeZone(string? timeZoneId)
    {
        if (string.IsNullOrWhiteSpace(timeZoneId))
            return TimeZoneInfo.Utc;

        try
        {
            return TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
        }
        catch (Exception ex) when (ex is TimeZoneNotFoundException or InvalidTimeZoneException)
        {
            return TimeZoneInfo.Utc;
        }
    }
}

public sealed class GenerateAiPlanValidator : AbstractValidator<GenerateAiPlanCommand>
{
    public GenerateAiPlanValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.UserText).NotEmpty().MaximumLength(4000);
    }
}