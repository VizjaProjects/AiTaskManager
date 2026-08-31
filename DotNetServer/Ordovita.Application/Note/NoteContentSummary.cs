using System.Text;
using System.Text.Json;

namespace Ordovita.Application.Note;


public static class NoteContentSummary
{
    private const int MaxPreviewLength = 400;

    public static string Summarize(string rawJson)
    {
        if (string.IsNullOrWhiteSpace(rawJson)) return rawJson;

        if (!TryReadEnvelope(rawJson, out var version, out var format, out var enc, out var text))
            return rawJson;

        if (format != "ink") return rawJson;

        var envelope = new StringBuilder(MaxPreviewLength + 96);
        envelope.Append("{\"version\":").Append(version);
        envelope.Append(",\"format\":\"ink\"");
        envelope.Append(",\"enc\":").Append(JsonSerializer.Serialize(enc ?? "none"));
        envelope.Append(",\"text\":").Append(JsonSerializer.Serialize(Truncate(text)));
        envelope.Append(",\"truncated\":true}");
        return envelope.ToString();
    }

    private static string Truncate(string? text)
    {
        if (string.IsNullOrEmpty(text)) return string.Empty;
        return text.Length <= MaxPreviewLength ? text : text[..MaxPreviewLength];
    }

    private static bool TryReadEnvelope(
        string rawJson,
        out int version,
        out string? format,
        out string? enc,
        out string? text)
    {
        version = 1;
        format = null;
        enc = null;
        text = null;

        try
        {
            var reader = new Utf8JsonReader(Encoding.UTF8.GetBytes(rawJson));
            if (!reader.Read() || reader.TokenType != JsonTokenType.StartObject) return false;

            while (reader.Read())
            {
                if (reader.TokenType == JsonTokenType.EndObject) break;
                if (reader.TokenType != JsonTokenType.PropertyName) return false;

                var name = reader.GetString();
                if (!reader.Read()) return false;

                switch (name)
                {
                    case "version" when reader.TokenType == JsonTokenType.Number:
                        version = reader.GetInt32();
                        break;
                    case "format" when reader.TokenType == JsonTokenType.String:
                        format = reader.GetString();
                        break;
                    case "enc" when reader.TokenType == JsonTokenType.String:
                        enc = reader.GetString();
                        break;
                    case "text" when reader.TokenType == JsonTokenType.String:
                        text = reader.GetString();
                        break;
                    default:
                        reader.Skip();
                        break;
                }
            }

            return true;
        }
        catch (JsonException)
        {
            return false;
        }
    }
}
