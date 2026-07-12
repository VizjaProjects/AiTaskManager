namespace Ordovita.Infrastructure.Llm.Groq;

public sealed record Message(string Role, string Content);

public record GroqRequest(string Model, IReadOnlyList<Message> Messages)
{
    public static GroqRequest Of(string model, string systemPrompt, string userPrompt)
    {
        return new GroqRequest(model,
        [
            new Message("system", systemPrompt),
            new Message("user", userPrompt)
        ]);
    }
}
