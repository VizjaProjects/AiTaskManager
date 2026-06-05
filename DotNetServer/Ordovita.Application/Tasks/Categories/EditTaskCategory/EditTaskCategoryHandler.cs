using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Categories.EditTaskCategory;

public sealed record EditTaskCategoryCommand(Guid WorkspaceId, Guid CategoryId, string Name, string Color)
    : ICommand<EditTaskCategoryResult>;

public sealed class EditTaskCategoryHandler(
    WorkspaceAccessGuard accessGuard,
    ITaskCategoryRepository categoryRepository,
    IUnitOfWork uow) : ICommandHandler<EditTaskCategoryCommand, EditTaskCategoryResult>
{
    public async Task<Result<EditTaskCategoryResult>> Handle(EditTaskCategoryCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<EditTaskCategoryResult>(access.Error);

        var category = await categoryRepository.GetByIdAsync(TaskCategoryId.From(command.CategoryId), ct);
        if (category is null || !category.BelongsToWorkspace(WorkspaceId.From(command.WorkspaceId)))
            return Result.Failure<EditTaskCategoryResult>(CategoryExceptions.NotFound);

        var editResult = category.Edit(command.Name, command.Color);
        if (editResult.IsFailure)
            return Result.Failure<EditTaskCategoryResult>(editResult.Error);

        await uow.SaveChangesAsync(ct);
        return Result.Success(new EditTaskCategoryResult(
            category.Id.Value, category.Name, category.Color, category.UpdatedAt));
    }
}

public sealed class EditTaskCategoryValidator : FluentValidation.AbstractValidator<EditTaskCategoryCommand>
{
    public EditTaskCategoryValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(20);
    }
}
