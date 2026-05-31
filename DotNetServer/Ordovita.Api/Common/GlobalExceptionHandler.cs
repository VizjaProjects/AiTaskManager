using System.Text.Json;
using Microsoft.AspNetCore.Diagnostics;

namespace Ordovita.Api.Common;

public sealed class GlobalExceptionHandler : IExceptionHandler
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