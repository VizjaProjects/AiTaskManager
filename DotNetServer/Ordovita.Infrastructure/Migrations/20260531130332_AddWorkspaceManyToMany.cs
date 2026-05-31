using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordovita.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkspaceManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Workspace.Workspace",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    WorkspaceName = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CreatedBy = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Workspace.Workspace", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Workspace.Workspace_Identity.DomainUser_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Identity.DomainUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

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

            migrationBuilder.CreateIndex(
                name: "IX_Workspace.Workspace_CreatedBy",
                table: "Workspace.Workspace",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Workspace.Workspace_WorkspaceName",
                table: "Workspace.Workspace",
                column: "WorkspaceName");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Workspace.AssignedUsers");

            migrationBuilder.DropTable(
                name: "Workspace.Workspace");
        }
    }
}
