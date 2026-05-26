using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Identity.RegisterUser;

namespace Ordovita.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);


        services.AddScoped<ICommandHandler<RegisterUserCommand, Guid>, RegisterUserHandler>();


        return services;
    }
}