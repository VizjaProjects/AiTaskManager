namespace Ordovita.Infrastructure.Identity;

public sealed class OAuth2Options
{
    public const string Section = "OAuth2";
    public string FrontendUrl { get; set; } = "http://localhost:8081";
    public string DesktopBrowserCallbackUrl { get; set; } = "http://localhost:8081/desktop-oauth-complete";
}