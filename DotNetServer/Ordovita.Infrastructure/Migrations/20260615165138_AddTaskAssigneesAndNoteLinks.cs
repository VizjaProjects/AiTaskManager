using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordovita.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskAssigneesAndNoteLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Note.NoteEventLinks",
                columns: table => new
                {
                    NoteId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    EventId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    LinkedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Note.NoteEventLinks", x => new { x.NoteId, x.EventId });
                    table.ForeignKey(
                        name: "FK_Note.NoteEventLinks_Note.Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Note.Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Note.NoteEventLinks_Tasks.Events_EventId",
                        column: x => x.EventId,
                        principalTable: "Tasks.Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Note.NoteTaskLinks",
                columns: table => new
                {
                    NoteId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TaskId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    LinkedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Note.NoteTaskLinks", x => new { x.NoteId, x.TaskId });
                    table.ForeignKey(
                        name: "FK_Note.NoteTaskLinks_Note.Notes_NoteId",
                        column: x => x.NoteId,
                        principalTable: "Note.Notes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Note.NoteTaskLinks_Tasks.WorkTasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Tasks.WorkTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Tasks.WorkTaskAssignees",
                columns: table => new
                {
                    TaskId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    AssignedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks.WorkTaskAssignees", x => new { x.TaskId, x.UserId });
                    table.ForeignKey(
                        name: "FK_Tasks.WorkTaskAssignees_Identity.DomainUser_UserId",
                        column: x => x.UserId,
                        principalTable: "Identity.DomainUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Tasks.WorkTaskAssignees_Tasks.WorkTasks_TaskId",
                        column: x => x.TaskId,
                        principalTable: "Tasks.WorkTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Note.NoteEventLinks_EventId",
                table: "Note.NoteEventLinks",
                column: "EventId");

            migrationBuilder.CreateIndex(
                name: "IX_Note.NoteTaskLinks_TaskId",
                table: "Note.NoteTaskLinks",
                column: "TaskId");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks.WorkTaskAssignees_UserId",
                table: "Tasks.WorkTaskAssignees",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Note.NoteEventLinks");

            migrationBuilder.DropTable(
                name: "Note.NoteTaskLinks");

            migrationBuilder.DropTable(
                name: "Tasks.WorkTaskAssignees");
        }
    }
}
