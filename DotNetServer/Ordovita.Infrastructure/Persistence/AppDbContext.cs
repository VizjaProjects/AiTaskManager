using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Domain.Identity;
using Ordovita.Domain.LlmSettings;
using Ordovita.Domain.Note;
using Ordovita.Domain.Surveys.Questions;
using Ordovita.Domain.Surveys.UserResponse;
using Ordovita.Domain.Tasks;
using Ordovita.Infrastructure.Identity;
using WorkspaceAggregate = Ordovita.Domain.Workspace.Workspace;

namespace Ordovita.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<AspIdentityUser>(options), IUnitOfWork
{
    public DbSet<DomainUser> DomainUser => Set<DomainUser>();

    public DbSet<Domain.Surveys.Surveys.Survey> Surveys => Set<Domain.Surveys.Surveys.Survey>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<UserResponse> UserResponses => Set<UserResponse>();

    public DbSet<WorkspaceAggregate> Workspaces => Set<WorkspaceAggregate>();

    public DbSet<WorkTask> WorkTasks => Set<WorkTask>();
    public DbSet<TaskCategory> TaskCategories => Set<TaskCategory>();
    public DbSet<WorkTaskStatus> WorkTaskStatuses => Set<WorkTaskStatus>();
    public DbSet<WorkCalendar> WorkCalendars => Set<WorkCalendar>();
    public DbSet<CalendarEvent> CalendarEvents => Set<CalendarEvent>();

    public DbSet<Domain.LlmSettings.LlmSettings> LlmSettings => Set<Domain.LlmSettings.LlmSettings>();

    public DbSet<Domain.Note.Note> Notes => Set<Domain.Note.Note>();
    public DbSet<NoteFolder> NoteFolders => Set<NoteFolder>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}