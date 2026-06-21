using Ordovita.Domain.Common;

namespace Ordovita.Domain.LlmStatistic;

public class LlmStatisticException
{
    public static readonly Error NotFound =
        Error.NotFound("LlmStatistic.NotFound", "Task was not found.");

    public static readonly Error MissingPrompt =
        Error.Validation("LlmStatistic.MissingPrompt", "Prompt  is required.");

    public static readonly Error NegativeOutputTokenCount =
        Error.Validation("LlmStatistic.NegativeOutputTokenCount", "Output Token Count must be greater than zero.");

    public static readonly Error NegativeInputTokenCount =
        Error.Validation("LlmStatistic.NegativeInputTokenCount", "Input Token Count must be greater than zero.");

    public static readonly Error NegativeTotalTokenCount =
        Error.Validation("LlmStatistic.NegativeTotalTokenCount", "Total Token Count must be greater than zero.");

    public static readonly Error RequestedByIsMissing =
        Error.Validation("LlmStatistic.RequestedByIsMissing", "RequestedBy is missing! ");

    public static readonly Error RequestTypeMissing =
        Error.Validation("LlmStatistic.RequestTypeMissing", "Request type is required! ");
}