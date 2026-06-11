using System.Net.Http.Headers;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Ordovita.Application.Abstraction.Crypto;
using Ordovita.Application.Abstraction.Email;
using Ordovita.Application.Abstraction.Identity;
using Ordovita.Application.Abstraction.Llm;
using Ordovita.Application.Abstraction.LlmSettings;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys.GetUserAnswers;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmSettings.Port;
using Ordovita.Domain.Note.Port;
using Ordovita.Infrastructure.AspIdentity;
using Ordovita.Infrastructure.Cqrs;
using Ordovita.Infrastructure.Email;
using Ordovita.Infrastructure.Identity;
using Ordovita.Infrastructure.Identity.Persistence;
using Ordovita.Infrastructure.Persistence;
using Ordovita.Domain.Surveys.port;
using Ordovita.Domain.Tasks.port;
using Ordovita.Domain.Workspace.port;
using Ordovita.Infrastructure.Crypto;
using Ordovita.Infrastructure.Llm;
using Ordovita.Infrastructure.Llm.Groq;
using Ordovita.Infrastructure.Llm.LlmTornado;
using Ordovita.Infrastructure.LlmSettings;
using Ordovita.Infrastructure.LlmSettings.Persistance;
using Ordovita.Infrastructure.Note.Persistence;
using Ordovita.Infrastructure.Survey;
using Ordovita.Infrastructure.Survey.Persistence.Repository;
using Ordovita.Infrastructure.Tasks;
using Ordovita.Infrastructure.Tasks.Persistence.Repository;
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
        services.AddSingleton(sp => sp.GetRequiredService<IOptions<GroqConfiguration>>().Value);
        services.AddTransient<IEmailSender<AspIdentityUser>, SmtpIdentityEmailSender>();
        services.AddScoped<IEmailTemplateRenderer, EmailTemplateRenderer>();

        services.AddScoped<IAiClient, LlmTornadoProvider>();

        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<AppDbContext>());
        services.AddScoped<ISender, Sender>();

        services.AddScoped<ILlmPlanningService, LlmPlanningService>();

        services.AddScoped<IUserContext, UserContext>();

        services.AddScoped<IUserAnswerReader, UserAnswerReader>();

        services.AddScoped<ISurveyRepository, SurveyRepository>();
        services.AddScoped<IQuestionRepository, QuestionRepository>();
        services.AddScoped<IQuestionOptionRepository, QuestionOptionRepository>();
        services.AddScoped<IUserResponseRepository, UserResponseRepository>();
        services.AddScoped<INoteRepository, NoteRepository>();
        services.AddScoped<INoteFolderRepository, NoteFolderRepository>();

        

        services.AddScoped<IWorkspaceRepository, WorkspaceRepository>();

        services.AddScoped<IWorkTaskRepository, WorkTaskRepository>();
        services.AddScoped<ITaskCategoryRepository, TaskCategoryRepository>();
        services.AddScoped<IWorkTaskStatusRepository, WorkTaskStatusRepository>();
        services.AddScoped<IWorkCalendarRepository, WorkCalendarRepository>();
        services.AddScoped<ICalendarEventRepository, CalendarEventRepository>();
        services.AddScoped<IWorkspaceTaskInitializer, WorkspaceTaskInitializer>();
        services.AddScoped<ILlmSettingsRepository, LlmSettingsRepository>();
        services.AddScoped<ICryptoService, CryptoService>();

        services.AddScoped<ILlmSettingsModels, LlmSettingsModels>();
        services.AddScoped<ILlmSettingsProviders, LlmSettingsProviders>();


        services.AddHttpContextAccessor();

        services.AddScoped<IAspIdentityService, AspIdentityService>();
        services.AddScoped<IExternalAuthService, ExternalAuthService>();
        services.AddScoped<IUserRepository, UserRepository>();


        return services;
    }
}