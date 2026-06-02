using System.Text.Json.Serialization;

namespace Ordovita.Infrastructure.Llm.Groq;

public record GroqApiResponse(
    IReadOnlyList<Choice> Choices, 
    Usage Usage
);

public record Choice(ResponseMessage Message);

public record ResponseMessage(string Role, string Content);

public record Usage(
    [property: JsonPropertyName("prompt_tokens")] int PromptTokens,
    [property: JsonPropertyName("completion_tokens")] int CompletionTokens,
    [property: JsonPropertyName("total_tokens")] int TotalTokens
);