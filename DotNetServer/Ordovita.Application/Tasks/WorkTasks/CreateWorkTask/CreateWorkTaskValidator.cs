using FluentValidation;

namespace Ordovita.Application.Tasks.WorkTasks.CreateWorkTask;

public sealed class CreateWorkTaskValidator : AbstractValidator<CreateWorkTaskCommand>
{
    public CreateWorkTaskValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.StatusId).NotEmpty();
        RuleFor(x => x.EstimatedDuration).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Priority).IsInEnum();
        RuleFor(x => x.Steps).NotNull().Must(steps => steps.Count <= Ordovita.Domain.Tasks.WorkTask.MaxSteps)
            .WithMessage("A task cannot have more than 20 steps.");
        RuleForEach(x => x.Steps).ChildRules(step =>
        {
            step.RuleFor(value => value.Title).NotEmpty().MaximumLength(Ordovita.Domain.Tasks.WorkTask.StepTitleMaxLength);
            step.RuleFor(value => value.AssignedUserId).NotEqual(Guid.Empty)
                .When(value => value.AssignedUserId.HasValue);
        });
    }
}
