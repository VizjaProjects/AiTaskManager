using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace;

namespace Ordovita.Infrastructure.Workspace.Persistance;

public sealed class WorkspaceConfiguration : IEntityTypeConfiguration<Domain.Workspace.Workspace>
{
    public void Configure(EntityTypeBuilder<Domain.Workspace.Workspace> builder)
    {
        builder.ToTable("Workspaces");

        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id)
            .HasConversion(id => id.Value, value => WorkspaceId.From(value))
            .ValueGeneratedNever();

        builder.Property(w => w.WorkspaceName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(w => w.CreatedBy)
            .HasConversion(id => id.Value, value => UserId.From(value))
            .IsRequired();

        builder.Property(w => w.Visibility)
            .HasConversion<string>()
            .HasMaxLength(20)
            .ValueGeneratedNever()
            .IsRequired();

        builder.Property(w => w.CreatedAt).IsRequired();
        builder.Property(w => w.UpdatedAt).IsRequired();

        builder.HasOne<DomainUser>()
            .WithMany()
            .HasForeignKey(w => w.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(w => w.AssignedUsers)
            .WithOne()
            .HasForeignKey(wu => wu.WorkspaceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(w => w.AssignedUsers).HasField("_assignedUsers");
        builder.Ignore(w => w.DomainEvents);

        builder.HasIndex(w => w.WorkspaceName);
        builder.HasIndex(w => w.CreatedBy);
    }
}