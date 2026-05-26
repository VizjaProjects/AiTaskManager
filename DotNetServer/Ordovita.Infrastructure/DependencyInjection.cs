using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ordovita.Application.Abstraction.Email;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Identity;
using Ordovita.Infrastructure.AspIdentity;
using Ordovita.Infrastructure.Cqrs;
using Ordovita.Infrastructure.Email;
using Ordovita.Infrastructure.Identity;
using Ordovita.Infrastructure.Identity.Persistence;
using Ordovita.Infrastructure.Persistence;

namespace Ordovita.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Database")
                               ?? throw new InvalidOperationException("ConnectionString 'Database' is missing.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

        services.Configure<EmailOptions>(configuration.GetSection(EmailOptions.SectionName));
        services.AddTransient<IEmailSender<AspIdentityUser>, SmtpIdentityEmailSender>();
        services.AddScoped<IEmailTemplateRenderer, EmailTemplateRenderer>();


        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());
        services.AddScoped<ISender, Sender>();


        services.AddScoped<IAspIdentityService, AspIdentityService>();
        services.AddScoped<IUserRepository, UserRepository>();


        return services;
    }
}