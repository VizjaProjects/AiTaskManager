namespace Ordovita.Application.Abstraction.Email;

public interface IEmailTemplateRenderer
{
    Task<string> RenderAsync(string templateName, Dictionary<string, string> vars);
}