namespace Ordovita.Application.Abstraction.Llm;

public sealed record AiRequest(
    string SystemPrompt,
    string UserPrompt,
    object? ResponseSchema = null)
{
    public string AuditPrompt => $"SYSTEM:\n{SystemPrompt}\n\nUSER:\n{UserPrompt}";

    public static AiRequest Create(string systemPrompt, string userPrompt, object? responseSchema = null)
    {
        if (string.IsNullOrWhiteSpace(systemPrompt))
            throw new ArgumentException("System prompt cannot be blank.", nameof(systemPrompt));
        if (string.IsNullOrWhiteSpace(userPrompt))
            throw new ArgumentException("User prompt cannot be blank.", nameof(userPrompt));

        return new AiRequest(systemPrompt, userPrompt, responseSchema);
    }
}
