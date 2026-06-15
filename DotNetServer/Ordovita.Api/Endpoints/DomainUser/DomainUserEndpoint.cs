using Ordovita.Api.Common;
using Ordovita.Api.Endpoints.Identity;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.DomainUser.ChangeFullname;
using Ordovita.Application.DomainUser.DeleteAccount;
using Ordovita.Application.DomainUser.SetupDefaultWorkspace;
using Ordovita.Application.User;
using Ordovita.Application.Workspaces;
using Ordovita.Domain.Identity;


namespace Ordovita.Api.Endpoints.DomainUser;

public static class DomainUserEndpoint
{
    public static RouteGroupBuilder MapDomainUserEndpoints(this IEndpointRouteBuilder root)
    {
        var g = root.MapGroup("/user")
            .WithTags("Users").RequireAuthorization();

        g.MapGet("/me", GetCurrentUser)
            .WithName("GetCurrentUser")
            .Produces<CurrentUserResponse>(200)
            .Produces(401);

        g.MapPost("/fullname", ChangeFullname)
            .WithName("ChangeFullName")
            .WithSummary("Change full name")
            .Produces<UserDto>(200)
            .Produces(401)
            .Produces(404);

        g.MapPut("/defaultWorkspace/{workspaceId:guid}", SetUpDefaultWorkspace)
            .WithName("SetUpDefaultWorkspace")
            .WithSummary("Set up default workspace for user")
            .Produces<UserDto>(200)
            .Produces(401)
            .Produces(404);

        g.MapGet("/delete", DeleteAccount)
            .WithName("DeleteAccount")
            .WithSummary("Delete account")
            .Produces<UserDto>(200)
            .Produces(401)
            .Produces(404);


        return g;
    }

    public static async Task<IResult> GetCurrentUser(
        IUserContext userContext,
        IUserRepository userRepository,
        CancellationToken ct)
    {
        var userResult = await WorkspaceUserResolver.GetCurrentDomainUserAsync(userContext, userRepository, ct);
        if (userResult.IsFailure)
            return userResult.Error.ToProblem();

        var user = userResult.Value!;
        return Results.Ok(new CurrentUserResponse(
            user.Id.Value,
            user.Email.Value,
            user.FullName,
            user.Role.ToString(),
            user.DefaultWorkspaceId?.Value));
    }

    public static async Task<IResult> ChangeFullname(string newFullName, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new ChangeFullNameCommand(newFullName), ct);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : result.Error.ToProblem();
    }

    public static async Task<IResult> DeleteAccount(ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteAccountCommand(), ct);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : result.Error.ToProblem();
    }

    public static async Task<IResult> SetUpDefaultWorkspace(Guid workspaceId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new SetUpDefaultWorkspaceCommand(workspaceId), ct);

        return result.IsSuccess
            ? Results.Ok(result.Value)
            : result.Error.ToProblem();
    }
}