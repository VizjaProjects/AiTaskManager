using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Workspaces;

namespace Ordovita.Application.Workspaces.AssignUsersByEmail;

public sealed record AssignUsersByEmailCommand(Guid WorkspaceId, IReadOnlyList<string> Emails)
    : ICommand<AssignUsersByEmailResult>;

public sealed record AssignUsersByEmailResult(
    WorkspaceDto Workspace,
    IReadOnlyList<string> AddedEmails,
    IReadOnlyList<string> NotFoundEmails,
    IReadOnlyList<string> AlreadyAssignedEmails);