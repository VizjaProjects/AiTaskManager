using System.Net.Http.Headers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Ordovita.Application.Abstraction.Email;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Llm;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys.GetUserAnswers;
using Ordovita.Domain.Identity;
using Ordovita.Infrastructure.AspIdentity;
using Ordovita.Infrastructure.Cqrs;
using Ordovita.Infrastructure.Email;
using Ordovita.Infrastructure.Identity;
using Ordovita.Infrastructure.Identity.Persistence;
using Ordovita.Infrastructure.Persistence;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Workspace.port;
using Ordovita.Infrastructure.Llm.Groq;
using Ordovita.Infrastructure.Survey;
using Ordovita.Infrastructure.Survey.Persistence.Repository;
using Ordovita.Infrastructure.Workspace.Persistance;

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
        services.Configure<GroqConfiguration>(configuration.GetSection(GroqConfiguration.SectionName));
        services.AddTransient<IEmailSender<AspIdentityUser>, SmtpIdentityEmailSender>();
        services.AddScoped<IEmailTemplateRenderer, EmailTemplateRenderer>();


        services.AddHttpClient<IAiClient, AiGroqClient>((serviceProvider, client) =>
        {
            var config = serviceProvider.GetRequiredService<GroqConfiguration>();
    
            client.BaseAddress = new Uri("https://api.groq.com/openai/v1/");
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", config.ApiKey);
        });
        
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());
        services.AddScoped<ISender, Sender>();

        services.AddScoped<IUserContext, UserContext>();

        services.AddScoped<IUserAnswerReader, UserAnswerReader>();

        services.AddScoped<ISurveyRepository, SurveyRepository>();
        services.AddScoped<IQuestionRepository, QuestionRepository>();
        services.AddScoped<IUserResponseRepository, UserResponseRepository>();

        services.AddScoped<IWorkspaceRepository, WorkspaceRepository>();

        services.AddHttpContextAccessor();

        services.AddScoped<IAspIdentityService, AspIdentityService>();
        services.AddScoped<IUserRepository, UserRepository>();


        return services;
    }
}