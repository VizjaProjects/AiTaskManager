namespace Ordovita.Application.Abstraction.Llm;

public sealed record AiResponse(string Content, int TokenCount, string Prompt);