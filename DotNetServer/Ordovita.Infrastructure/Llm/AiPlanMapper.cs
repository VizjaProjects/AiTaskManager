using Ordovita.Domain.Tasks;

namespace Ordovita.Infrastructure.Llm;

internal static class AiPlanMapper
{
    public static TaskPriority ParsePriority(string? priority)
    {
        if (string.IsNullOrWhiteSpace(priority))
            return TaskPriority.MEDIUM;

        var normalized = priority.Trim().ToUpperInvariant();

        if (normalized == "CRITICAL")
            return TaskPriority.URGENT;

        return Enum.TryParse<TaskPriority>(normalized, out var parsed)
            ? parsed
            : TaskPriority.MEDIUM;
    }

    public static string Clamp(string value, int maxLength)
    {
        return value.Length <= maxLength ? value : value[..maxLength];
    }

    public static DateTime ToUtc(DateTime value)
    {
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
    }
}