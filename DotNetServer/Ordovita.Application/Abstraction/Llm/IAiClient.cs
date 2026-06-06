using Ordovita.Domain.Common;

namespace Ordovita.Application.Abstraction.Llm;

public interface IAiClient
{
    Task<Result<AiResponse>> AskAsync(AiRequest request, CancellationToken ct);
}