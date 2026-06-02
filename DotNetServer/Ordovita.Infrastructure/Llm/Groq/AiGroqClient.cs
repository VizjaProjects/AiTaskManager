using System.Net.Http.Json;
using Ordovita.Application.Abstraction.Llm;

namespace Ordovita.Infrastructure.Llm.Groq;

public class AiGroqClient(HttpClient client, GroqConfiguration configuration) : IAiClient
{

    public async Task<AiResponse> AskAsync(AiRequest request, CancellationToken ct = default)
    {
        var body = GroqRequest.Of(configuration.Model, request.Prompt);

        var responseMessage = await client.PostAsJsonAsync("chat/completions", body, ct);
        
        responseMessage.EnsureSuccessStatusCode(); 

        var response = await responseMessage.Content.ReadFromJsonAsync<GroqApiResponse>(cancellationToken: ct);

        if (response?.Choices == null || response.Choices.Count == 0)
        {
            throw new  NullReferenceException("Empty response from Groq API");
        }

        var content = response.Choices[0].Message.Content;
        var inputTokens = response.Usage?.PromptTokens ?? 0;
        var outputTokens = response.Usage?.CompletionTokens ?? 0;

        var tokensConst = inputTokens + outputTokens;
        return new AiResponse(content, tokensConst, request.Prompt);
    }
}