using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Categories.DeleteTaskCategory;

public sealed record DeleteTaskCategoryCommand(Guid WorkspaceId, Guid CategoryId) : ICommand<Unit>;

public sealed class DeleteTaskCategoryHandler(
    WorkspaceAccessGuard accessGuard,
    ITaskCategoryRepository categoryRepository,
    IUnitOfWork uow) : ICommandHandler<DeleteTaskCategoryCommand, Unit>
{
    public async Task<Result<Unit>> Handle(DeleteTaskCategoryCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<Unit>(access.Error);

        var category = await categoryRepository.GetByIdAsync(TaskCategoryId.From(command.CategoryId), ct);
        if (category is null || !category.BelongsToWorkspace(WorkspaceId.From(command.WorkspaceId)))
            return Result.Failure<Unit>(CategoryExceptions.NotFound);

        categoryRepository.Delete(category);
        await uow.SaveChangesAsync(ct);
        return Result.Success(Unit.Value);
    }
}

public sealed class DeleteTaskCategoryValidator : AbstractValidator<DeleteTaskCategoryCommand>
{
    public DeleteTaskCategoryValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.CategoryId).NotEmpty();
    }
}