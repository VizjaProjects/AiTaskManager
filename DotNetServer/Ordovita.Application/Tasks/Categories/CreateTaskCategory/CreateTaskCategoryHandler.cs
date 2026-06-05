using FluentValidation;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks;
using Ordovita.Domain.Tasks.Exception;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Categories.CreateTaskCategory;

public sealed record CreateTaskCategoryCommand(Guid WorkspaceId, string Name, string Color)
    : ICommand<CreateTaskCategoryResult>;

public sealed class CreateTaskCategoryHandler(
    WorkspaceAccessGuard accessGuard,
    ITaskCategoryRepository categoryRepository,
    IUnitOfWork uow) : ICommandHandler<CreateTaskCategoryCommand, CreateTaskCategoryResult>
{
    private const int MaxCategoriesPerWorkspace = 20;

    public async Task<Result<CreateTaskCategoryResult>> Handle(CreateTaskCategoryCommand command, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(command.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<CreateTaskCategoryResult>(access.Error);

        var workspaceId = WorkspaceId.From(command.WorkspaceId);
        if (await categoryRepository.CountByWorkspaceIdAsync(workspaceId, ct) >= MaxCategoriesPerWorkspace)
            return Result.Failure<CreateTaskCategoryResult>(CategoryExceptions.LimitReached);

        var categoryResult = TaskCategory.Create(workspaceId, access.Value.User.Id, command.Name, command.Color);
        if (categoryResult.IsFailure)
            return Result.Failure<CreateTaskCategoryResult>(categoryResult.Error);

        await categoryRepository.AddAsync(categoryResult.Value!, ct);
        await uow.SaveChangesAsync(ct);

        return Result.Success(new CreateTaskCategoryResult(
            categoryResult.Value!.Id.Value, categoryResult.Value.CreatedAt));
    }
}

public sealed class CreateTaskCategoryValidator : FluentValidation.AbstractValidator<CreateTaskCategoryCommand>
{
    public CreateTaskCategoryValidator()
    {
        RuleFor(x => x.WorkspaceId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Color).NotEmpty().MaximumLength(20);
    }
}
