using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Plan;

namespace Ordovita.Infrastructure.Plan.Persistence;

public class PlanConfiguration : IEntityTypeConfiguration<Domain.Plan.Plan>
{
    public void Configure(EntityTypeBuilder<Domain.Plan.Plan> builder)
    {
        builder.ToTable("Plan.Plan");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasConversion(p => p.Value, value => PlanId.From(value)).ValueGeneratedNever();

        builder.Property(p => p.AiTaskLimit).IsRequired();
        builder.Property(p => p.PlanName).IsRequired().HasMaxLength(128);
        builder.Property(p => p.PrivateWorkspaceLimit).IsRequired();
        builder.Property(p => p.PublicWorkspaceLimit).IsRequired();
        builder.Property(p => p.IsActive).IsRequired();


        builder.HasIndex(p => p.PlanName).IsUnique();
    }
}