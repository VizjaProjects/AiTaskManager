using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ordovita.Api.Common;
using Ordovita.Api.Endpoints;
using Ordovita.Application;
using Ordovita.Infrastructure;
using Ordovita.Infrastructure.Identity;
using Ordovita.Infrastructure.Persistence;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();

builder.Services.AddIdentityApiEndpoints<AspIdentityUser>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.Configure<Microsoft.AspNetCore.Authentication.AuthenticationOptions>(options =>
{
    options.DefaultAuthenticateScheme = IdentityConstants.BearerScheme;
    options.DefaultChallengeScheme = IdentityConstants.BearerScheme;
});

builder.Services.AddAuthorization(options =>
{
    options.DefaultPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddOpenApi(options => { options.AddDocumentTransformer<BearerSecuritySchemeTransformer>(); });


var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    await RoleSeeder.SeedAsync(roleManager);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("SmoothDelivery API")
            .AddPreferredSecuritySchemes("Bearer")
            .AddHttpAuthentication("Bearer", auth => auth.Token = "");
    });
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapApiEndpoints();

app.Run();