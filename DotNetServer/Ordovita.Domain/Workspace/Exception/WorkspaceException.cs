using Ordovita.Domain.Common;

namespace Ordovita.Domain.Workspace.Exception;

public static class WorkspaceException
{
    public static readonly Error MissingWorkspaceName =
        Error.Validation("Workspace.MissingWorkspaceName", "Workspace name is required.");

    public static readonly Error MissingCreateByUser =
        Error.Validation("Workspace.MissingCreateByUser", "Created by user id is required.");

    public static readonly Error UnauthorizedAccess =
        Error.Validation("Workspace.UnauthorizedAccess", "You are not authorized to access this resource.");

    public static readonly Error AlreadyAssigned =
        Error.Validation("Workspace.AlreadyAssigned", "You cannot add user who  is already assigned.");

    public static readonly Error UserNotFound =
        Error.Validation("Workspace.UserNotFound", "You cannot remove user who is not assigned to this workspace.");

    public static readonly Error NotFound =
        Error.NotFound("Workspace.NotFound", "Workspace was not found.");

    public static readonly Error PrivateWorkspace =
        Error.Validation("Workspace.Private",
            "This workspace is private. Make it public before assigning members.");
}