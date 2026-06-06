using System.Net.Http.Json;
using Microsoft.Extensions.Logging;
using Ordovita.Application.Abstraction.Llm;
using Ordovita.Domain.Common;

namespace Ordovita.Infrastructure.Llm.Groq;

public class AiGroqClient(HttpClient client, GroqConfiguration configuration, ILogger<AiGroqClient> logger)
    : IAiClient
{
    public async Task<Result<AiResponse>> AskAsync(AiRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(configuration.ApiKey) || string.IsNullOrWhiteSpace(configuration.Model))
            return Result.Failure<AiResponse>(GroqErrors.NotConfigured);

        try
        {
            var body = GroqRequest.Of(configuration.Model, request.Prompt);

            var responseMessage = await client.PostAsJsonAsync("chat/completions", body, ct);

            if (!responseMessage.IsSuccessStatusCode)
            {
                var error = await responseMessage.Content.ReadAsStringAsync(ct);
                logger.LogError("Groq request failed with {Status}: {Body}", (int)responseMessage.StatusCode, error);
                return Result.Failure<AiResponse>(GroqErrors.RequestFailed((int)responseMessage.StatusCode));
            }

            var response = await responseMessage.Content.ReadFromJsonAsync<GroqApiResponse>(ct);

            var content = response?.Choices is { Count: > 0 } choices ? choices[0].Message.Content : null;
            if (string.IsNullOrWhiteSpace(content))
            {
                logger.LogError("Groq returned an empty completion.");
                return Result.Failure<AiResponse>(GroqErrors.EmptyResponse);
            }

            var promptTokens = response!.Usage?.PromptTokens ?? 0;
            var completionTokens = response.Usage?.CompletionTokens ?? 0;

            return Result.Success(new AiResponse(content, promptTokens + completionTokens, request.Prompt));
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            logger.LogError(ex, "Groq request could not be completed.");
            return Result.Failure<AiResponse>(GroqErrors.Unreachable);
        }
    }
}

internal static class GroqErrors
{
    public static readonly Error NotConfigured =
        new("Ai.Groq.NotConfigured", "The AI provider is not configured (missing API key or model).",
            ErrorType.Failure);

    public static readonly Error EmptyResponse =
        new("Ai.Groq.EmptyResponse", "The AI provider returned an empty response.", ErrorType.Failure);

    public static readonly Error Unreachable =
        new("Ai.Groq.Unreachable", "The AI provider could not be reached.", ErrorType.Failure);

    public static Error RequestFailed(int statusCode) =>
        new("Ai.Groq.RequestFailed", $"The AI provider responded with HTTP {statusCode}.", ErrorType.Failure);
}
