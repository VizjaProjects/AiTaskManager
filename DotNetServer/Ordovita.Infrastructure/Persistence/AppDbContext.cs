using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Ordovita.Application.Abstraction.Persistance;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Surveys.Questions;
using Ordovita.Domain.Surveys.UserResponse;
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


    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}