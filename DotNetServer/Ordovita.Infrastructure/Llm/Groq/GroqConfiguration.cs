namespace Ordovita.Infrastructure.Llm.Groq;

public sealed class GroqConfiguration
{
    public const string SectionName = "GroqSection";
    public string Model { get; init; } = "";
    public string ApiKey { get; init; } = "";
}