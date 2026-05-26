using Microsoft.Extensions.Hosting;
using Ordovita.Application.Abstraction.Email;

namespace Ordovita.Infrastructure.Email;

public class EmailTemplateRenderer(IHostEnvironment env) : IEmailTemplateRenderer
{
    public async Task<string> RenderAsync(string templateName, Dictionary<string, string> vars)
    {
        var path = Path.Combine(env.ContentRootPath, "EmailTemplates", templateName);
        var html = await File.ReadAllTextAsync(path);
        foreach (var (key, value) in vars)
            html = html.Replace($"{{{{{key}}}}}", value);
        return html;
    }
}