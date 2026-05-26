using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Ordovita.Domain.Identity;

namespace Ordovita.Infrastructure.Identity.Persistence;

public sealed class UserConfiguration : IEntityTypeConfiguration<DomainUser>
{
    public void Configure(EntityTypeBuilder<DomainUser> builder)
    {
        builder.ToTable("Identity.DomainUser");

        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasConversion(
            id => id.Value,
            value => UserId.From(value)
        ).ValueGeneratedNever();

        builder.Property(u => u.FullName).HasMaxLength(64).IsRequired();

        builder.Property(u => u.Email).HasConversion(
            email => email.Value,
            value => Domain.Identity.Email.From(value)
        ).HasMaxLength(64).IsRequired();
        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.Role).HasConversion<string>().HasMaxLength(16).IsRequired();

        builder.Property(u => u.IsEnable).IsRequired();

        builder.Property(u => u.CreatedAt).IsRequired();

        builder.Property(u => u.UpdatedAt).IsRequired();

        builder.Property(u => u.IsEmailVerified);

        builder.Property(u => u.EmailVerificationAt);

        builder.Property(u => u.AspIdentityUserId).IsRequired();
        builder.HasIndex(u => u.AspIdentityUserId).IsUnique();

        builder.Ignore(u => u.DomainEvents);
    }
}