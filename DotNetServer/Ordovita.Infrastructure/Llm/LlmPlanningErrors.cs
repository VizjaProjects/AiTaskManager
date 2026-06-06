using Ordovita.Domain.Common;

namespace Ordovita.Infrastructure.Llm;

internal static class LlmPlanningErrors
{
    public static readonly Error InvalidAiResponse =
        new("LlmPlanning.InvalidResponse", "The AI response could not be interpreted as a valid plan.",
            ErrorType.Failure);

    public static readonly Error NoStatuses =
        Error.Validation("LlmPlanning.NoStatuses", "The workspace has no task statuses to assign generated tasks to.");
}
