using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordovita.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateWorkspaceUserModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Workspace.Workspace_Identity.DomainUser_CreatedBy",
                table: "Workspace.Workspace");

            migrationBuilder.DropTable(
                name: "Workspace.AssignedUsers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Workspace.Workspace",
                table: "Workspace.Workspace");

            migrationBuilder.RenameTable(
                name: "Workspace.Workspace",
                newName: "Workspaces");

            migrationBuilder.RenameIndex(
                name: "IX_Workspace.Workspace_WorkspaceName",
                table: "Workspaces",
                newName: "IX_Workspaces_WorkspaceName");

            migrationBuilder.RenameIndex(
                name: "IX_Workspace.Workspace_CreatedBy",
                table: "Workspaces",
                newName: "IX_Workspaces_CreatedBy");

            migrationBuilder.AlterColumn<string>(
                name: "WorkspaceName",
                table: "Workspaces",
                type: "varchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(150)",
                oldMaxLength: 150)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Workspaces",
                table: "Workspaces",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "WorkspaceUsers",
                columns: table => new
                {
                    WorkspaceId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    AssignedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkspaceUsers", x => new { x.WorkspaceId, x.UserId });
                    table.ForeignKey(
                        name: "FK_WorkspaceUsers_Identity.DomainUser_UserId",
                        column: x => x.UserId,
                        principalTable: "Identity.DomainUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WorkspaceUsers_Workspaces_WorkspaceId",
                        column: x => x.WorkspaceId,
                        principalTable: "Workspaces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_WorkspaceUsers_UserId",
                table: "WorkspaceUsers",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Workspaces_Identity.DomainUser_CreatedBy",
                table: "Workspaces",
                column: "CreatedBy",
                principalTable: "Identity.DomainUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Workspaces_Identity.DomainUser_CreatedBy",
                table: "Workspaces");

            migrationBuilder.DropTable(
                name: "WorkspaceUsers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Workspaces",
                table: "Workspaces");

            migrationBuilder.RenameTable(
                name: "Workspaces",
                newName: "Workspace.Workspace");

            migrationBuilder.RenameIndex(
                name: "IX_Workspaces_WorkspaceName",
                table: "Workspace.Workspace",
                newName: "IX_Workspace.Workspace_WorkspaceName");

            migrationBuilder.RenameIndex(
                name: "IX_Workspaces_CreatedBy",
                table: "Workspace.Workspace",
                newName: "IX_Workspace.Workspace_CreatedBy");

            migrationBuilder.AlterColumn<string>(
                name: "WorkspaceName",
                table: "Workspace.Workspace",
                type: "varchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "varchar(200)",
                oldMaxLength: 200)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Workspace.Workspace",
                table: "Workspace.Workspace",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Workspace.AssignedUsers",
                columns: table => new
                {
                    WorkspaceId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workspace.AssignedUsers", x => new { x.WorkspaceId, x.UserId });
                    table.ForeignKey(
                        name: "FK_Workspace.AssignedUsers_Identity.DomainUser_UserId",
                        column: x => x.UserId,
                        principalTable: "Identity.DomainUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Workspace.AssignedUsers_Workspace.Workspace_WorkspaceId",
                        column: x => x.WorkspaceId,
                        principalTable: "Workspace.Workspace",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Workspace.AssignedUsers_UserId",
                table: "Workspace.AssignedUsers",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Workspace.Workspace_Identity.DomainUser_CreatedBy",
                table: "Workspace.Workspace",
                column: "CreatedBy",
                principalTable: "Identity.DomainUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
