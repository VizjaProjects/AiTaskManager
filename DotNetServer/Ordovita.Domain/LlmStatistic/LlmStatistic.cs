using Ordovita.Domain.Common;
using Ordovita.Domain.Identity;

namespace Ordovita.Domain.LlmStatistic;

public enum RequestType
{
    Custom,
    Standard
}

public class LlmStatistic : AggregateRoot<LlmStatisticId>
{
    public string Prompt { get; private set; }
    public int OutputTokenCount { get; private set; }
    public int InputTokenCount { get; private set; }
    public int TotalTokenCount { get; private set; }
    public DateTime RequestedAt { get; private set; }
    public UserId RequestedBy { get; private set; }
    public RequestType RequestType { get; private set; }

    public static Result<LlmStatistic> Create(string prompt, int outputTokenCount, int inputTokenCount,
        int totalTokenCount,
        UserId requestedBy, RequestType requestType)
    {
        if (string.IsNullOrEmpty(prompt)) Result.Failure<LlmStatistic>(LlmStatisticException.MissingPrompt);
        if (outputTokenCount < 0) Result.Failure<LlmStatistic>(LlmStatisticException.NegativeOutputTokenCount);
        if (inputTokenCount < 0) Result.Failure<LlmStatistic>(LlmStatisticException.NegativeInputTokenCount);
        if (totalTokenCount < 0) Result.Failure<LlmStatistic>(LlmStatisticException.NegativeTotalTokenCount);
        if (requestedBy.Value == Guid.Empty) Result.Failure<LlmStatistic>(LlmStatisticException.RequestedByIsMissing);
        if (string.IsNullOrEmpty(requestType.ToString()))
            Result.Failure<LlmStatistic>(LlmStatisticException.RequestTypeMissing);

        var llmStatistic = new LlmStatistic
        {
            Id = LlmStatisticId.New(),
            Prompt = prompt,
            OutputTokenCount = outputTokenCount,
            InputTokenCount = inputTokenCount,
            TotalTokenCount = totalTokenCount,
            RequestedBy = requestedBy,
            RequestedAt = DateTime.UtcNow,
            RequestType = requestType
        };


        return Result.Success(llmStatistic);
    }
}