using Ordovita.Api.Endpoints.DomainUser;
using Ordovita.Api.Endpoints.Identity;
using Ordovita.Api.Endpoints.Surveys;
using Ordovita.Api.Endpoints.Workspaces;
using Ordovita.Infrastructure.Identity;

namespace Ordovita.Api.Endpoints;

public static class ApiEndpointsExtensions
{
    public static IEndpointRouteBuilder MapApiEndpoints(this IEndpointRouteBuilder app)
    {
        var api = app.MapGroup("/api/v1");

        api.MapAspIdentityApi();
        api.MapDomainUserEndpoints();
        api.MapSurveyEndpoints();
        api.MapQuestionEndpoints();
        api.MapUserResponseEndpoints();
        api.MapWorkspaceEndpoints();
        return app;
    }
}