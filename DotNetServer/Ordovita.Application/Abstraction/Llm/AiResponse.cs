namespace Ordovita.Application.Abstraction.Llm;

public enum RequestType
{
    Custom,
    Standard
}

public sealed record AiResponse(string Content,int InputTokenCount, int OutputTokenCount, int TokenCount, string Prompt,  RequestType RequestType);