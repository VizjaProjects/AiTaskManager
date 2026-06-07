using System.Text.Json;
using System.Text.Json.Serialization;

namespace Ordovita.Infrastructure.Llm;

internal static class AiPlanResponseParser
{
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true
    };

    public static AiPlanJson? Parse(string? content)
    {
        var json = Sanitize(content);
        if (string.IsNullOrWhiteSpace(json))
            return null;

        try
        {
            return JsonSerializer.Deserialize<AiPlanJson>(json, Options);
        }
        catch (JsonException)
        {
            return null;
        }
    }

    private static string Sanitize(string? content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return string.Empty;

        var json = content.Trim();
        if (!json.StartsWith("```", StringComparison.Ordinal))
            return json;

        var firstLineBreak = json.IndexOf('\n');
        if (firstLineBreak >= 0)
            json = json[(firstLineBreak + 1)..];

        if (json.EndsWith("```", StringComparison.Ordinal))
            json = json[..^3];

        return json.Trim();
    }
}

internal sealed record AiPlanJson(
    [property: JsonPropertyName("tasks")] IReadOnlyList<AiTaskJson>? Tasks,
    [property: JsonPropertyName("events")] IReadOnlyList<AiEventJson>? Events);

internal sealed record AiTaskJson(
    [property: JsonPropertyName("title")] string? Title,
    [property: JsonPropertyName("description")]
    string? Description,
    [property: JsonPropertyName("priority")]
    string? Priority,
    [property: JsonPropertyName("categoryId")]
    Guid? CategoryId,
    [property: JsonPropertyName("statusId")]
    Guid? StatusId,
    [property: JsonPropertyName("estimatedDuration")]
    int? EstimatedDuration,
    [property: JsonPropertyName("dueDateTime")]
    DateTime? DueDateTime,
    [property: JsonPropertyName("newCategoryName")]
    string? NewCategoryName,
    [property: JsonPropertyName("newCategoryColor")]
    string? NewCategoryColor);

internal sealed record AiEventJson(
    [property: JsonPropertyName("title")] string? Title,
    [property: JsonPropertyName("startDateTime")]
    DateTime? StartDateTime,
    [property: JsonPropertyName("endDateTime")]
    DateTime? EndDateTime,
    [property: JsonPropertyName("allDay")] bool? AllDay);