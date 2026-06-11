using System.Collections.Concurrent;
using System.Security.Cryptography;

namespace Ordovita.Api.Endpoints.Identity;

public sealed class DesktopOAuthCodeService
{
    private static readonly TimeSpan CodeTtl = TimeSpan.FromMinutes(2);
    private const int CodeBytes = 32;

    private readonly ConcurrentDictionary<string, DesktopOAuthPayload> _codes = new();

    public string Create(TokenPair tokenPair, LoginUserInfo userInfo)
    {
        CleanupExpiredCodes();

        var codeBytes = RandomNumberGenerator.GetBytes(CodeBytes);
        var code = Base64UrlEncode(codeBytes);

        _codes[code] = new DesktopOAuthPayload(tokenPair, userInfo, DateTimeOffset.UtcNow.Add(CodeTtl));
        return code;
    }

    public DesktopOAuthPayload Consume(string code)
    {
        if (string.IsNullOrWhiteSpace(code))
            throw new InvalidOperationException("Desktop OAuth code is required");

        if (!_codes.TryRemove(code, out var payload))
            throw new InvalidOperationException("Invalid desktop OAuth code");

        if (payload.ExpiresAt <= DateTimeOffset.UtcNow)
            throw new InvalidOperationException("Desktop OAuth code has expired");

        return payload;
    }

    private void CleanupExpiredCodes()
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in _codes)
            if (entry.Value.ExpiresAt <= now)
                _codes.TryRemove(entry.Key, out _);
    }

    private static string Base64UrlEncode(byte[] data)
    {
        return Convert.ToBase64String(data).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public sealed record DesktopOAuthPayload(
        TokenPair TokenPair,
        LoginUserInfo UserInfo,
        DateTimeOffset ExpiresAt);
}