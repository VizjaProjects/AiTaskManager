using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;
using Ordovita.Domain.Workspace;

namespace Ordovita.Infrastructure.Workspace.Persistance;

public sealed class WorkspaceUserConfiguration : IEntityTypeConfiguration<WorkspaceUser>
{
    public void Configure(EntityTypeBuilder<WorkspaceUser> builder)
    {
        builder.ToTable("WorkspaceUsers");

        builder.HasKey(wu => new { wu.WorkspaceId, wu.UserId });

        builder.Property(wu => wu.WorkspaceId)
            .HasConversion(id => id.Value, value => WorkspaceId.From(value));
        builder.Property(wu => wu.UserId)
            .HasConversion(id => id.Value, value => UserId.From(value));
        builder.Property(wu => wu.AssignedAt).IsRequired();

        builder.HasOne<DomainUser>()
            .WithMany()
            .HasForeignKey(wu => wu.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(wu => wu.UserId);
    }
}
