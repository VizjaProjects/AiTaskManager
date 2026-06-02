namespace Ordovita.Application.Abstraction.Llm;

public sealed record AiRequest(string Prompt)
{
    public static AiRequest Create(string prompt)
    {
        if(string.IsNullOrWhiteSpace(prompt)) throw new ArgumentNullException("Prompt cannot be null", nameof(prompt));
        return new AiRequest(prompt);
    }
}