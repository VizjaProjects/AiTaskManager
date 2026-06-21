using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmStatistic;
using Ordovita.Domain.Plan;
using Ordovita.Domain.Workspace.port;

namespace Ordovita.Application.Admin.GetAllUsersForAdmin;

public sealed record GetAllUsersForAdminQuery() : IQuery<IReadOnlyList<AdminUserDto>>;

public class GetAllUsersForAdminHandler(
    IUserRepository userRepository,
    IPlanRepository planRepository,
    IWorkspaceRepository workspaceRepository,
    ILlmStatisticRepository llmStatisticRepository)
    : IQueryHandler<GetAllUsersForAdminQuery, IReadOnlyList<AdminUserDto>>
{
    public async Task<Result<IReadOnlyList<AdminUserDto>>> Handle(GetAllUsersForAdminQuery query,
        CancellationToken ct)
    {
        var users = await userRepository.GetAllAsync(ct);
        var plans = await planRepository.GetAllAsync(ct);
        var planById = plans.ToDictionary(p => p.Id);

        var result = new List<AdminUserDto>(users.Count);

        foreach (var user in users)
        {
            planById.TryGetValue(user.PlanId, out var plan);

            var aiTaskUsage = await llmStatisticRepository.CountByRequestedAtAndRequestedBy(user.Id, ct);
            var publicWorkspaceUsage = await workspaceRepository.GetPublicWorkspaceCountAsync(user.Id, ct);
            var privateWorkspaceUsage = await workspaceRepository.GetPrivateWorkspaceCountAsync(user.Id, ct);

            result.Add(new AdminUserDto(
                user.Id.Value,
                user.FullName,
                user.Email.Value,
                user.Role.ToString(),
                user.IsEnable,
                plan?.Id.Value,
                plan?.PlanName,
                plan?.IsActive ?? false,
                aiTaskUsage,
                plan?.AiTaskLimit ?? 0,
                publicWorkspaceUsage,
                plan?.PublicWorkspaceLimit ?? 0,
                privateWorkspaceUsage,
                plan?.PrivateWorkspaceLimit ?? 0));
        }

        return Result.Success<IReadOnlyList<AdminUserDto>>(result);
    }
}
