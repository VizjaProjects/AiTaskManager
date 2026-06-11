namespace Ordovita.Infrastructure.Identity;

public sealed class GoogleAuthOptions
{
    public const string Section = "Authentication:Google";
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
}