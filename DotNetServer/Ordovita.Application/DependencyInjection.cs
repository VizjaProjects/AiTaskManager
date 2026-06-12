using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Ordovita.Application.Abstraction.Llm;
using Ordovita.Application.Common.Behaviors;
using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Tasks.Ai.GenerateAiPlan;
using Ordovita.Application.DomainUser.ChangeFullname;
using Ordovita.Application.DomainUser.DeleteAccount;
using Ordovita.Application.Identity.ConfirmUserEmail;
using Ordovita.Application.Identity.GoogleOAuth;
using Ordovita.Application.Identity.RegisterUser;
using Ordovita.Application.LlmSettings;
using Ordovita.Application.LlmSettings.CreateLlmSettings;
using Ordovita.Application.LlmSettings.DeleteLlmSettings;
using Ordovita.Application.LlmSettings.GetAllModels;
using Ordovita.Application.LlmSettings.GetAllProviders;
using Ordovita.Application.LlmSettings.GetLlmSettingById;
using Ordovita.Application.LlmSettings.GetLlmSettings;
using Ordovita.Application.LlmSettings.UpdateLlmSettings;
using Ordovita.Application.Note;
using Ordovita.Application.Note.CreateNote;
using Ordovita.Application.Note.CreateNoteFolder;
using Ordovita.Application.Note.DeleteNote;
using Ordovita.Application.Note.DeleteNoteFolder;
using Ordovita.Application.Note.GetWorkspaceNoteFolders;
using Ordovita.Application.Note.GetWorkspaceNotes;
using Ordovita.Application.Note.UpdateNoteContent;
using Ordovita.Application.Note.UpdateNoteFolder;
using Ordovita.Application.Note.UpdateNoteMetadata;
using Ordovita.Application.Surveys;
using Ordovita.Application.Surveys.ChangeSurveyVisibility;
using Ordovita.Application.Surveys.CreateSurvey;
using Ordovita.Application.Surveys.DeleteSurvey;
using Ordovita.Application.Surveys.EditSurvey;
using Ordovita.Application.Surveys.GetActiveSurveys;
using Ordovita.Application.Surveys.Questions.GetQuestionOptions;
using Ordovita.Application.Surveys.GetAllSurveys;
using Ordovita.Application.Surveys.GetSurveyResponses;
using Ordovita.Application.Surveys.GetUserAnswers;
using Ordovita.Application.Surveys.Questions.CreateQuestion;
using Ordovita.Application.Surveys.Questions.DeleteQuestion;
using Ordovita.Application.Surveys.Questions.EditQuestion;
using Ordovita.Application.Surveys.Questions.GetQuestionsBySurvey;
using Ordovita.Application.Surveys.UserResponses.AddUserResponse;
using Ordovita.Application.Surveys.UserResponses.ChangeUserResponse;
using Ordovita.Application.Surveys.UserResponses.DeleteUserResponse;
using Ordovita.Application.User;
using Ordovita.Domain.Surveys.port;
using Ordovita.Application.Workspaces;
using Ordovita.Application.Workspaces.AssignUsersToWorkspace;
using Ordovita.Application.Workspaces.CreateWorkspace;
using Ordovita.Application.Workspaces.DeleteWorkspace;
using Ordovita.Application.Workspaces.GetMyWorkspaces;
using Ordovita.Application.Workspaces.GetWorkspaceById;
using Ordovita.Application.Workspaces.RemoveUsersFromWorkspace;
using Ordovita.Application.Tasks;
using Ordovita.Application.Tasks.Categories.CreateTaskCategory;
using Ordovita.Application.Tasks.Categories.DeleteTaskCategory;
using Ordovita.Application.Tasks.Categories.EditTaskCategory;
using Ordovita.Application.Tasks.Categories.GetWorkspaceCategories;
using Ordovita.Application.Tasks.Events.CreateCalendarEvent;
using Ordovita.Application.Tasks.Events.DeleteCalendarEvent;
using Ordovita.Application.Tasks.Events.EditCalendarEvent;
using Ordovita.Application.Tasks.Events.GetWorkspaceEvents;
using Ordovita.Application.Tasks.TaskStatuses.CreateWorkTaskStatus;
using Ordovita.Application.Tasks.TaskStatuses.DeleteWorkTaskStatus;
using Ordovita.Application.Tasks.TaskStatuses.EditWorkTaskStatus;
using Ordovita.Application.Tasks.TaskStatuses.GetWorkspaceTaskStatuses;
using Ordovita.Application.Tasks.Proposals.GetPendingProposals;
using Ordovita.Application.Tasks.Proposals.AcceptAiTask;
using Ordovita.Application.Tasks.Proposals.RejectAiTask;
using Ordovita.Application.Tasks.Proposals.AcceptAiEvent;
using Ordovita.Application.Tasks.Proposals.RejectAiEvent;
using Ordovita.Application.Tasks.WorkTasks.CreateWorkTask;
using Ordovita.Application.Tasks.WorkTasks.DeleteWorkTask;
using Ordovita.Application.Tasks.WorkTasks.EditWorkTask;
using Ordovita.Application.Tasks.WorkTasks.GetWorkspaceTasks;
using Ordovita.Application.Workspaces.AssignUsersByEmail;

namespace Ordovita.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);

        services.AddScoped(typeof(IPipelineBehavior<>), typeof(ValidationBehavior<>));

        services.AddScoped<ICommandHandler<RegisterUserCommand, Guid>, RegisterUserHandler>();
        services.AddScoped<ICommandHandler<ConfirmUserEmailCommand, Guid>, ConfirmUserEmailHandler>();
        services.AddScoped<ICommandHandler<GoogleOAuthLoginCommand, GoogleOAuthLoginResult>, GoogleOAuthLoginHandler>();

        services.AddScoped<ICommandHandler<ChangeFullNameCommand, UserDto>, ChangeFullnameHandler>();
        services.AddScoped<ICommandHandler<DeleteAccountCommand, UserDto>, DeleteAccountHandler>();

        services.AddScoped<ICommandHandler<CreateSurveyCommand, CreateSurveyResult>, CreateSurveyHandler>();
        services.AddScoped<ICommandHandler<EditSurveyCommand, SurveySummaryDto>, EditSurveyHandler>();
        services
            .AddScoped<ICommandHandler<ChangeSurveyVisibilityCommand, SurveySummaryDto>,
                ChangeSurveyVisibilityHandler>();
        services.AddScoped<ICommandHandler<DeleteSurveyCommand, Unit>, DeleteSurveyHandler>();
        services.AddScoped<IQueryHandler<GetAllSurveysQuery, IReadOnlyList<SurveySummaryDto>>, GetAllSurveysHandler>();
        services
            .AddScoped<IQueryHandler<GetActiveSurveysQuery, IReadOnlyList<SurveySummaryDto>>,
                GetActiveSurveysHandler>();

        services.AddScoped<ICommandHandler<CreateQuestionCommand, CreateQuestionResult>, CreateQuestionHandler>();
        services.AddScoped<ICommandHandler<EditQuestionCommand, EditQuestionResult>, EditQuestionHandler>();
        services.AddScoped<ICommandHandler<DeleteQuestionCommand, DeleteQuestionResult>, DeleteQuestionHandler>();
        services
            .AddScoped<IQueryHandler<GetQuestionsBySurveyQuery, IReadOnlyList<QuestionDto>>,
                GetQuestionsBySurveyHandler>();
        services
            .AddScoped<IQueryHandler<GetQuestionOptionsQuery, IReadOnlyList<QuestionOptionDto>>,
                GetQuestionOptionsHandler>();

        services.AddScoped<ICommandHandler<AddUserResponseCommand, AddUserResponseResult>, AddUserResponseHandler>();
        services
            .AddScoped<ICommandHandler<ChangeUserResponseCommand, ChangeUserResponseResult>,
                ChangeUserResponseHandler>();
        services.AddScoped<ICommandHandler<DeleteUserResponseCommand, Unit>, DeleteUserResponseHandler>();
        services
            .AddScoped<IQueryHandler<GetUserAnswersQuery, IReadOnlyList<SurveyWithAnswersDto>>,
                GetUserAnswersHandler>();
        services
            .AddScoped<IQueryHandler<GetSurveyResponsesQuery, IReadOnlyList<SurveyWithAnswersDto>>,
                GetSurveyResponsesHandler>();

        services.AddScoped<ICommandHandler<CreateWorkspaceCommand, WorkspaceDto>, CreateWorkspaceHandler>();
        services.AddScoped<IQueryHandler<GetWorkspaceByIdQuery, WorkspaceDto>, GetWorkspaceByIdHandler>();
        services.AddScoped<IQueryHandler<GetMyWorkspacesQuery, IReadOnlyList<WorkspaceDto>>, GetMyWorkspacesHandler>();
        services
            .AddScoped<ICommandHandler<AssignUsersToWorkspaceCommand, WorkspaceDto>, AssignUsersToWorkspaceHandler>();
        services
            .AddScoped<ICommandHandler<RemoveUsersFromWorkspaceCommand, WorkspaceDto>,
                RemoveUsersFromWorkspaceHandler>();
        services.AddScoped<ICommandHandler<DeleteWorkspaceCommand, Unit>, DeleteWorkspaceHandler>();

        services.AddScoped<WorkspaceTaskEnsurer>();
        services.AddScoped<WorkspaceAccessGuard>();

        services.AddScoped<ICommandHandler<CreateWorkTaskCommand, CreateWorkTaskResult>, CreateWorkTaskHandler>();
        services.AddScoped<ICommandHandler<EditWorkTaskCommand, EditWorkTaskResult>, EditWorkTaskHandler>();
        services.AddScoped<ICommandHandler<DeleteWorkTaskCommand, Unit>, DeleteWorkTaskHandler>();
        services
            .AddScoped<IQueryHandler<GetWorkspaceTasksQuery, IReadOnlyList<WorkTaskDto>>, GetWorkspaceTasksHandler>();

        services
            .AddScoped<ICommandHandler<CreateCalendarEventCommand, CreateCalendarEventResult>,
                CreateCalendarEventHandler>();
        services
            .AddScoped<ICommandHandler<EditCalendarEventCommand, EditCalendarEventResult>, EditCalendarEventHandler>();
        services.AddScoped<ICommandHandler<DeleteCalendarEventCommand, Unit>, DeleteCalendarEventHandler>();
        services
            .AddScoped<IQueryHandler<GetWorkspaceEventsQuery, IReadOnlyList<CalendarEventDto>>,
                GetWorkspaceEventsHandler>();

        services
            .AddScoped<ICommandHandler<CreateTaskCategoryCommand, CreateTaskCategoryResult>,
                CreateTaskCategoryHandler>();
        services.AddScoped<ICommandHandler<EditTaskCategoryCommand, EditTaskCategoryResult>, EditTaskCategoryHandler>();
        services.AddScoped<ICommandHandler<DeleteTaskCategoryCommand, Unit>, DeleteTaskCategoryHandler>();
        services
            .AddScoped<IQueryHandler<GetWorkspaceCategoriesQuery, IReadOnlyList<TaskCategoryDto>>,
                GetWorkspaceCategoriesHandler>();

        services
            .AddScoped<ICommandHandler<CreateWorkTaskStatusCommand, CreateWorkTaskStatusResult>,
                CreateWorkTaskStatusHandler>();
        services
            .AddScoped<ICommandHandler<EditWorkTaskStatusCommand, EditWorkTaskStatusResult>,
                EditWorkTaskStatusHandler>();
        services.AddScoped<ICommandHandler<DeleteWorkTaskStatusCommand, Unit>, DeleteWorkTaskStatusHandler>();
        services
            .AddScoped<IQueryHandler<GetWorkspaceTaskStatusesQuery, IReadOnlyList<WorkTaskStatusDto>>,
                GetWorkspaceTaskStatusesHandler>();

        services
            .AddScoped<ICommandHandler<GenerateAiPlanCommand, GeneratedLlmPlanResult>, GenerateAiPlanHandler>();

        services.AddScoped<IQueryHandler<GetPendingProposalsQuery, PendingProposalsDto>, GetPendingProposalsHandler>();
        services.AddScoped<ICommandHandler<AcceptAiTaskCommand, AcceptAiTaskResult>, AcceptAiTaskHandler>();
        services.AddScoped<ICommandHandler<RejectAiTaskCommand, Unit>, RejectAiTaskHandler>();
        services.AddScoped<ICommandHandler<AcceptAiEventCommand, AcceptAiEventResult>, AcceptAiEventHandler>();
        services.AddScoped<ICommandHandler<RejectAiEventCommand, Unit>, RejectAiEventHandler>();
        services
            .AddScoped<ICommandHandler<AssignUsersByEmailCommand, AssignUsersByEmailResult>,
                AssignUsersByEmailHandler>();


        services.AddScoped<ICommandHandler<CreateLlmSettingsCommand, LlmSettingsDto>, CreateLlmSettingsHandler>();
        services.AddScoped<ICommandHandler<DeleteLlmSettingsCommand, Unit>, DeleteLlmSettingsHandler>();
        services.AddScoped<IQueryHandler<GetAllModelsQuery, IReadOnlyList<string>>, GetAllModelsHandler>();
        services.AddScoped<IQueryHandler<GetAllProvidersQuery, IReadOnlyList<string>>, GetAllProvidersHandler>();
        services.AddScoped<IQueryHandler<GetLlmSettingsByIdHandlerQuery, LlmSettingsDto>, GetLlmSettingsByIdHandler>();
        services
            .AddScoped<IQueryHandler<GetAllLlmSettingsQuery, IReadOnlyList<LlmSettingsDto>>, GetLlmSettingsHandler>();
        services.AddScoped<ICommandHandler<UpdateLlmSettingsCommand, LlmSettingsDto>, UpdateLlmSettingsHandler>();
        
        services.AddScoped<ICommandHandler<CreateNoteFolderCommand, CreateNoteFolderResult>, CreateNoteFolderHandler>();
        services.AddScoped<ICommandHandler<UpdateNoteFolderCommand, Unit>, UpdateNoteFolderHandler>();
        services.AddScoped<ICommandHandler<DeleteNoteFolderCommand, Unit>, DeleteNoteFolderHandler>();
        services.AddScoped<IQueryHandler<GetWorkspaceNoteFoldersQuery, IReadOnlyList<NoteFolderDto>>, GetWorkspaceNoteFoldersHandler>();
        
        services.AddScoped<ICommandHandler<CreateNoteCommand, CreateNoteResult>, CreateNoteHandler>();
        services.AddScoped<ICommandHandler<UpdateNoteContentCommand, Unit>, UpdateNoteContentHandler>();
        services.AddScoped<ICommandHandler<UpdateNoteMetadataCommand, Unit>, UpdateNoteMetadataHandler>();
        services.AddScoped<ICommandHandler<DeleteNoteCommand, Unit>, DeleteNoteHandler>();
        services.AddScoped<IQueryHandler<GetWorkspaceNotesQuery, IReadOnlyList<NoteDto>>, GetWorkspaceNotesHandler>();


        return services;
    }
}