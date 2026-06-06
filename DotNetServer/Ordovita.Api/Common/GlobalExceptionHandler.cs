using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;

namespace Ordovita.Api.Common;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken ct)
    {
        var (status, code, detail) = exception switch
        {
            JsonException =>
                (400, "Request.InvalidJson", "Request body is not valid JSON."),
            BadHttpRequestException ex =>
                (400, "Request.BadRequest", ex.Message),
            _ =>
                (500, "Server.Error", "An unexpected error occurred.")
        };

        if (status >= 500)
            logger.LogError(exception,
                "Unhandled exception for {Method} {Path}: {Message}",
                context.Request.Method, context.Request.Path, exception.Message);
        else
            logger.LogWarning(exception,
                "Request error ({Status}) for {Method} {Path}: {Message}",
                status, context.Request.Method, context.Request.Path, exception.Message);

        context.Response.StatusCode = status;
        await context.Response.WriteAsJsonAsync(new
        {
            type = $"https://httpstatuses.com/{status}",
            title = code,
            status,
            detail
        }, ct);
        return true;
    }
}