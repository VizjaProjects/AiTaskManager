using Ordovita.Api.Common;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.LlmSettings;
using Ordovita.Application.LlmSettings.CreateLlmSettings;
using Ordovita.Application.LlmSettings.DeleteLlmSettings;
using Ordovita.Application.LlmSettings.GetAllModels;
using Ordovita.Application.LlmSettings.GetAllProviders;
using Ordovita.Application.LlmSettings.GetLlmSettingById;
using Ordovita.Application.LlmSettings.GetLlmSettings;
using Ordovita.Application.LlmSettings.UpdateLlmSettings;

namespace Ordovita.Api.Endpoints.LlmSettings;

public static class LlmSettingsEndpoint

{
    public static RouteGroupBuilder MapLlmSettingsEndpoints(this IEndpointRouteBuilder root)
    {
        var g = root.MapGroup("/llm-settings").WithTags("Llm Settings").RequireAuthorization();


        g.MapPost("/", CreateLlmSettings)
            .WithName("CreateLlmSettings")
            .Produces<LlmSettingsDto>(201)
            .Produces(400)
            .Produces(404);

        g.MapGet("/models", GetAllModels)
            .WithName("GetAllModels")
            .Produces<IReadOnlyList<string>>(200)
            .Produces(404);


        g.MapGet("/providers", GetAllProviders)
            .WithName("GetAllProviders")
            .Produces<IReadOnlyList<string>>(200)
            .Produces(404);


        g.MapGet("/{llmSettingId:guid}", GetLlmSettingsById)
            .WithName("GetLlmSettingsById")
            .Produces<LlmSettingsDto>(200)
            .Produces(404);

        g.MapGet("/all-llmSettings", GetAllLlmSettings)
            .WithName("GetAllLlmSettings")
            .Produces<IReadOnlyList<LlmSettingsDto>>(200)
            .Produces(404);


        g.MapDelete("delete/{llmSettingId:guid}", DeleteLlmSettings)
            .WithName("DeleteLlmSettings")
            .Produces(202)
            .Produces(404);

        g.MapPut("/edit/{llmSettingId:guid}", UpdateLlmSettings)
            .WithName("UpdateLlmSettings")
            .Produces<LlmSettingsDto>(200)
            .Produces(400)
            .Produces(404);

        return g;
    }


    private static async Task<IResult> CreateLlmSettings(CreateLlmSettingsRequest request, ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(
            new CreateLlmSettingsCommand(request.Provider, request.Model, request.ApiKey, request.CustomUrl),
            ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> GetAllModels(ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetAllModelsQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> GetAllProviders(ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetAllProvidersQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> GetLlmSettingsById(Guid llmSettingId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetLlmSettingsByIdHandlerQuery(llmSettingId), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> GetAllLlmSettings(ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new GetAllLlmSettingsQuery(), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }

    private static async Task<IResult> UpdateLlmSettings(Guid llmSettingId, CreateLlmSettingsRequest request,
        ISender sender, CancellationToken ct)
    {
        var result =
            await sender.Send(
                new UpdateLlmSettingsCommand(llmSettingId, request.ApiKey, request.Provider, request.Model,
                    request.CustomUrl), ct);
        return result.IsSuccess ? Results.Ok(result.Value) : result.Error.ToProblem();
    }


    private static async Task<IResult> DeleteLlmSettings(Guid llmSettingId, ISender sender, CancellationToken ct)
    {
        var result = await sender.Send(new DeleteLlmSettingsCommand(llmSettingId), ct);
        return result.IsSuccess ? Results.Ok() : result.Error.ToProblem();
    }

    public sealed record CreateLlmSettingsRequest(string? Provider, string Model, string ApiKey, Uri? CustomUrl);
}