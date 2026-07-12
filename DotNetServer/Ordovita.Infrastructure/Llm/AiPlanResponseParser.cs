using System.Globalization;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Ordovita.Infrastructure.Llm;

internal static class AiPlanResponseParser
{
    private static readonly JsonDocumentOptions DocumentOptions = new()
    {
        CommentHandling = JsonCommentHandling.Skip,
        AllowTrailingCommas = true,
        MaxDepth = 64
    };

    public static AiPlanJson? Parse(string? content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return null;

        foreach (var candidate in ExtractJsonCandidates(content))
        {
            try
            {
                using var document = JsonDocument.Parse(candidate, DocumentOptions);
                var plan = ParseRoot(document.RootElement);
                if (plan is not null)
                    return plan;
            }
            catch (JsonException)
            {
                // Try the next complete JSON fragment from the response.
            }
        }

        return null;
    }

    private static AiPlanJson? ParseRoot(JsonElement root)
    {
        if (root.ValueKind == JsonValueKind.String)
            return Parse(root.GetString());

        if (root.ValueKind == JsonValueKind.Array)
            return new AiPlanJson(ParseTasks(root), []);

        if (root.ValueKind != JsonValueKind.Object)
            return null;

        var hasTasks = TryGetProperty(root, out var tasksElement, "tasks");
        var hasEvents = TryGetProperty(root, out var eventsElement, "events");

        if (!hasTasks && !hasEvents)
        {
            foreach (var wrapperName in new[] { "plan", "result", "response", "data" })
            {
                if (TryGetProperty(root, out var wrapped, wrapperName))
                {
                    var wrappedPlan = ParseRoot(wrapped);
                    if (wrappedPlan is not null)
                        return wrappedPlan;
                }
            }

            if (TryGetProperty(root, out _, "title"))
            {
                var singleTask = ParseTask(root);
                return singleTask is null ? null : new AiPlanJson([singleTask], []);
            }

            return null;
        }

        return new AiPlanJson(
            hasTasks ? ParseTasks(tasksElement) : [],
            hasEvents ? ParseEvents(eventsElement) : []);
    }

    private static IReadOnlyList<AiTaskJson> ParseTasks(JsonElement element)
    {
        var tasks = new List<AiTaskJson>();
        if (element.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined)
            return tasks;

        if (element.ValueKind != JsonValueKind.Array)
        {
            var single = ParseTask(element);
            if (single is not null)
                tasks.Add(single);
            return tasks;
        }

        foreach (var item in element.EnumerateArray())
        {
            var task = ParseTask(item);
            if (task is not null)
                tasks.Add(task);
        }

        return tasks;
    }

    private static AiTaskJson? ParseTask(JsonElement element)
    {
        if (element.ValueKind == JsonValueKind.String)
            return new AiTaskJson(element.GetString(), null, null, null, null, null, null, null, null, []);

        if (element.ValueKind != JsonValueKind.Object)
            return null;

        TryGetProperty(element, out var stepsElement, "steps", "subtasks", "subTasks");

        return new AiTaskJson(
            ReadString(element, "title", "name"),
            ReadString(element, "description", "details"),
            ReadString(element, "priority"),
            ReadGuid(element, "categoryId", "category_id"),
            ReadGuid(element, "statusId", "status_id"),
            ReadInt(element, "estimatedDuration", "duration", "estimated_duration"),
            ReadDateTime(element, "dueDateTime", "dueDate", "due_date_time"),
            ReadString(element, "newCategoryName", "new_category_name"),
            ReadString(element, "newCategoryColor", "new_category_color"),
            ParseSteps(stepsElement));
    }

    private static IReadOnlyList<AiTaskStepJson> ParseSteps(JsonElement element)
    {
        var steps = new List<AiTaskStepJson>();
        if (element.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined)
            return steps;

        if (element.ValueKind != JsonValueKind.Array)
        {
            var title = element.ValueKind == JsonValueKind.Object
                ? ReadString(element, "title", "name")
                : ScalarString(element);
            if (!string.IsNullOrWhiteSpace(title))
                steps.Add(new AiTaskStepJson(title));
            return steps;
        }

        foreach (var item in element.EnumerateArray())
        {
            var title = item.ValueKind == JsonValueKind.Object
                ? ReadString(item, "title", "name")
                : ScalarString(item);
            if (!string.IsNullOrWhiteSpace(title))
                steps.Add(new AiTaskStepJson(title));
        }

        return steps;
    }

    private static IReadOnlyList<AiEventJson> ParseEvents(JsonElement element)
    {
        var events = new List<AiEventJson>();
        if (element.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined)
            return events;

        if (element.ValueKind != JsonValueKind.Array)
        {
            var single = ParseEvent(element);
            if (single is not null)
                events.Add(single);
            return events;
        }

        foreach (var item in element.EnumerateArray())
        {
            var calendarEvent = ParseEvent(item);
            if (calendarEvent is not null)
                events.Add(calendarEvent);
        }

        return events;
    }

    private static AiEventJson? ParseEvent(JsonElement element)
    {
        if (element.ValueKind != JsonValueKind.Object)
            return null;

        return new AiEventJson(
            ReadString(element, "title", "name"),
            ReadDateTime(element, "startDateTime", "start", "start_date_time"),
            ReadDateTime(element, "endDateTime", "end", "end_date_time"),
            ReadBool(element, "allDay", "all_day"));
    }

    private static string? ReadString(JsonElement element, params string[] names)
    {
        return TryGetProperty(element, out var value, names) ? ScalarString(value) : null;
    }

    private static string? ScalarString(JsonElement value)
    {
        return value.ValueKind switch
        {
            JsonValueKind.String => value.GetString(),
            JsonValueKind.Number or JsonValueKind.True or JsonValueKind.False => value.ToString(),
            _ => null
        };
    }

    private static Guid? ReadGuid(JsonElement element, params string[] names)
    {
        var value = ReadString(element, names);
        return Guid.TryParse(value, out var parsed) && parsed != Guid.Empty ? parsed : null;
    }

    private static int? ReadInt(JsonElement element, params string[] names)
    {
        if (!TryGetProperty(element, out var value, names))
            return null;

        if (value.ValueKind == JsonValueKind.Number && value.TryGetInt32(out var number))
            return number;

        return int.TryParse(ScalarString(value), NumberStyles.Integer, CultureInfo.InvariantCulture, out number)
            ? number
            : null;
    }

    private static bool? ReadBool(JsonElement element, params string[] names)
    {
        if (!TryGetProperty(element, out var value, names))
            return null;

        if (value.ValueKind == JsonValueKind.True)
            return true;
        if (value.ValueKind == JsonValueKind.False)
            return false;
        if (bool.TryParse(ScalarString(value), out var boolean))
            return boolean;
        if (int.TryParse(ScalarString(value), out var number))
            return number != 0;
        return null;
    }

    private static DateTime? ReadDateTime(JsonElement element, params string[] names)
    {
        var value = ReadString(element, names);
        if (string.IsNullOrWhiteSpace(value) || string.Equals(value, "null", StringComparison.OrdinalIgnoreCase))
            return null;

        return DateTimeOffset.TryParse(
            value,
            CultureInfo.InvariantCulture,
            DateTimeStyles.AllowWhiteSpaces | DateTimeStyles.AssumeUniversal,
            out var parsed)
            ? parsed.UtcDateTime
            : null;
    }

    private static bool TryGetProperty(JsonElement element, out JsonElement value, params string[] names)
    {
        if (element.ValueKind == JsonValueKind.Object)
        {
            foreach (var property in element.EnumerateObject())
            foreach (var name in names)
            {
                if (string.Equals(property.Name, name, StringComparison.OrdinalIgnoreCase))
                {
                    value = property.Value;
                    return true;
                }
            }
        }

        value = default;
        return false;
    }

    private static IReadOnlyList<string> ExtractJsonCandidates(string content)
    {
        var candidates = new List<string>();
        var seen = new HashSet<string>(StringComparer.Ordinal);

        void Add(string? candidate)
        {
            var trimmed = candidate?.Trim();
            if (!string.IsNullOrWhiteSpace(trimmed) && seen.Add(trimmed))
                candidates.Add(trimmed);
        }

        Add(content);

        var fenceSearchStart = 0;
        while (fenceSearchStart < content.Length)
        {
            var fenceStart = content.IndexOf("```", fenceSearchStart, StringComparison.Ordinal);
            if (fenceStart < 0)
                break;

            var bodyStart = content.IndexOf('\n', fenceStart + 3);
            if (bodyStart < 0)
                break;

            var fenceEnd = content.IndexOf("```", bodyStart + 1, StringComparison.Ordinal);
            if (fenceEnd < 0)
                break;

            Add(content[(bodyStart + 1)..fenceEnd]);
            fenceSearchStart = fenceEnd + 3;
        }

        var fragments = ExtractBalancedFragments(content);
        for (var index = fragments.Count - 1; index >= 0; index--)
            Add(fragments[index]);

        return candidates;
    }

    private static IReadOnlyList<string> ExtractBalancedFragments(string content)
    {
        var fragments = new List<string>();

        for (var start = 0; start < content.Length; start++)
        {
            if (content[start] is not ('{' or '['))
                continue;

            var stack = new Stack<char>();
            var inString = false;
            var escaped = false;

            for (var index = start; index < content.Length; index++)
            {
                var character = content[index];
                if (inString)
                {
                    if (escaped)
                    {
                        escaped = false;
                        continue;
                    }

                    if (character == '\\')
                        escaped = true;
                    else if (character == '"')
                        inString = false;
                    continue;
                }

                if (character == '"')
                {
                    inString = true;
                    continue;
                }

                if (character is '{' or '[')
                {
                    stack.Push(character);
                    continue;
                }

                if (character is not ('}' or ']'))
                    continue;

                if (stack.Count == 0 ||
                    (character == '}' && stack.Peek() != '{') ||
                    (character == ']' && stack.Peek() != '['))
                    break;

                stack.Pop();
                if (stack.Count != 0)
                    continue;

                fragments.Add(content[start..(index + 1)]);
                start = index;
                break;
            }
        }

        return fragments;
    }
}

internal sealed record AiPlanJson(
    [property: JsonPropertyName("tasks")] IReadOnlyList<AiTaskJson>? Tasks,
    [property: JsonPropertyName("events")] IReadOnlyList<AiEventJson>? Events);

internal sealed record AiTaskJson(
    [property: JsonPropertyName("title")] string? Title,
    [property: JsonPropertyName("description")] string? Description,
    [property: JsonPropertyName("priority")] string? Priority,
    [property: JsonPropertyName("categoryId")] Guid? CategoryId,
    [property: JsonPropertyName("statusId")] Guid? StatusId,
    [property: JsonPropertyName("estimatedDuration")] int? EstimatedDuration,
    [property: JsonPropertyName("dueDateTime")] DateTime? DueDateTime,
    [property: JsonPropertyName("newCategoryName")] string? NewCategoryName,
    [property: JsonPropertyName("newCategoryColor")] string? NewCategoryColor,
    [property: JsonPropertyName("steps")] IReadOnlyList<AiTaskStepJson>? Steps);

internal sealed record AiTaskStepJson(
    [property: JsonPropertyName("title")] string? Title);

internal sealed record AiEventJson(
    [property: JsonPropertyName("title")] string? Title,
    [property: JsonPropertyName("startDateTime")] DateTime? StartDateTime,
    [property: JsonPropertyName("endDateTime")] DateTime? EndDateTime,
    [property: JsonPropertyName("allDay")] bool? AllDay);
