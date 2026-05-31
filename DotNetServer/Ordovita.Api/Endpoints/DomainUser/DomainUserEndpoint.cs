using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.DomainUser.ChangeFullname;
using Ordovita.Application.DomainUser.DeleteAccount;
using Ordovita.Application.User;


namespace Ordovita.Api.Endpoints.DomainUser;

public static class DomainUserEndpoint
{
    public static RouteGroupBuilder MapDomainUserEndpoints(this IEndpointRouteBuilder root)
    {
        var g = root.MapGroup("/user")
            .WithTags("Users").RequireAuthorization();


        g.MapPost("/fullname", ChangeFullname)
            .WithName("ChangeFullName")
            .WithSummary("Change full name")
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
}