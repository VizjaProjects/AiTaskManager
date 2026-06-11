using Ordovita.Application.Common.Cqrs;

namespace Ordovita.Application.Identity.GoogleOAuth;

public sealed record GoogleOAuthLoginCommand(string GoogleSubject, string Email, string FullName)
    : ICommand<GoogleOAuthLoginResult>;