namespace Ordovita.Application.Abstraction.Llm;

public interface IAiClient
{
    Task<AiResponse> AskAsync(AiRequest request, CancellationToken ct);
}