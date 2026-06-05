using FluentValidation;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace;

namespace Ordovita.Application.Tasks.Categories.GetWorkspaceCategories;

public sealed record GetWorkspaceCategoriesQuery(Guid WorkspaceId) : IQuery<IReadOnlyList<TaskCategoryDto>>;

public sealed class GetWorkspaceCategoriesHandler(
    WorkspaceAccessGuard accessGuard,
    ITaskCategoryRepository categoryRepository) : IQueryHandler<GetWorkspaceCategoriesQuery, IReadOnlyList<TaskCategoryDto>>
{
    public async Task<Result<IReadOnlyList<TaskCategoryDto>>> Handle(
        GetWorkspaceCategoriesQuery query, CancellationToken ct)
    {
        var access = await accessGuard.RequireAccessAsync(query.WorkspaceId, ct);
        if (access.IsFailure)
            return Result.Failure<IReadOnlyList<TaskCategoryDto>>(access.Error);

        var categories = await categoryRepository.GetByWorkspaceIdAsync(
            WorkspaceId.From(query.WorkspaceId), ct);

        return Result.Success<IReadOnlyList<TaskCategoryDto>>(
            categories.Select(TaskMapper.ToDto).ToList());
    }
}

public sealed class GetWorkspaceCategoriesValidator : FluentValidation.AbstractValidator<GetWorkspaceCategoriesQuery>
{
    public GetWorkspaceCategoriesValidator() => RuleFor(x => x.WorkspaceId).NotEmpty();
}
