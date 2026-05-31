using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.DomainUser.ChangeFullname;
using Ordovita.Application.DomainUser.DeleteAccount;
using Ordovita.Application.Identity.ConfirmUserEmail;
using Ordovita.Application.Identity.RegisterUser;
using Ordovita.Application.Surveys;
using Ordovita.Application.Surveys.ChangeSurveyVisibility;
using Ordovita.Application.Surveys.CreateSurvey;
using Ordovita.Application.Surveys.DeleteSurvey;
using Ordovita.Application.Surveys.EditSurvey;
using Ordovita.Application.Surveys.GetActiveSurveys;
using Ordovita.Application.Surveys.GetAllSurveys;
using Ordovita.Application.Surveys.GetUserAnswers;
using Ordovita.Application.Surveys.Questions.CreateQuestion;
using Ordovita.Application.Surveys.Questions.DeleteQuestion;
using Ordovita.Application.Surveys.Questions.EditQuestion;
using Ordovita.Application.Surveys.Questions.GetQuestionsBySurvey;
using Ordovita.Application.Surveys.UserResponses.AddUserResponse;
using Ordovita.Application.Surveys.UserResponses.ChangeUserResponse;
using Ordovita.Application.Surveys.UserResponses.DeleteUserResponse;
using Ordovita.Application.User;

namespace Ordovita.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped<ICommandHandler<RegisterUserCommand, Guid>, RegisterUserHandler>();
        services.AddScoped<ICommandHandler<ConfirmUserEmailCommand, Guid>, ConfirmUserEmailHandler>();

        services.AddScoped<ICommandHandler<ChangeFullNameCommand, UserDto>, ChangeFullnameHandler>();
        services.AddScoped<ICommandHandler<DeleteAccountCommand, UserDto>, DeleteAccountHandler>();

        services.AddScoped<ICommandHandler<CreateSurveyCommand, CreateSurveyResult>, CreateSurveyHandler>();
        services.AddScoped<ICommandHandler<EditSurveyCommand, SurveySummaryDto>, EditSurveyHandler>();
        services.AddScoped<ICommandHandler<ChangeSurveyVisibilityCommand, SurveySummaryDto>, ChangeSurveyVisibilityHandler>();
        services.AddScoped<ICommandHandler<DeleteSurveyCommand, Unit>, DeleteSurveyHandler>();
        services.AddScoped<IQueryHandler<GetAllSurveysQuery, IReadOnlyList<SurveySummaryDto>>, GetAllSurveysHandler>();
        services.AddScoped<IQueryHandler<GetActiveSurveysQuery, IReadOnlyList<SurveySummaryDto>>, GetActiveSurveysHandler>();

        services.AddScoped<ICommandHandler<CreateQuestionCommand, CreateQuestionResult>, CreateQuestionHandler>();
        services.AddScoped<ICommandHandler<EditQuestionCommand, EditQuestionResult>, EditQuestionHandler>();
        services.AddScoped<ICommandHandler<DeleteQuestionCommand, DeleteQuestionResult>, DeleteQuestionHandler>();
        services.AddScoped<IQueryHandler<GetQuestionsBySurveyQuery, IReadOnlyList<QuestionDto>>, GetQuestionsBySurveyHandler>();

        services.AddScoped<ICommandHandler<AddUserResponseCommand, AddUserResponseResult>, AddUserResponseHandler>();
        services.AddScoped<ICommandHandler<ChangeUserResponseCommand, ChangeUserResponseResult>, ChangeUserResponseHandler>();
        services.AddScoped<ICommandHandler<DeleteUserResponseCommand, Unit>, DeleteUserResponseHandler>();
        services.AddScoped<IQueryHandler<GetUserAnswersQuery, IReadOnlyList<SurveyWithAnswersDto>>, GetUserAnswersHandler>();

        return services;
    }
}
