using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordovita.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTaskHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Tasks.TaskHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TaskId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    UserId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Action = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    HistoryDate = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks.TaskHistories", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Tasks.TaskHistoryRecords",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TaskHistoryId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Field = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PrevValue = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NextValue = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tasks.TaskHistoryRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tasks.TaskHistoryRecords_Tasks.TaskHistories_TaskHistoryId",
                        column: x => x.TaskHistoryId,
                        principalTable: "Tasks.TaskHistories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Tasks.TaskHistories_TaskId_HistoryDate",
                table: "Tasks.TaskHistories",
                columns: new[] { "TaskId", "HistoryDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Tasks.TaskHistoryRecords_TaskHistoryId",
                table: "Tasks.TaskHistoryRecords",
                column: "TaskHistoryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Tasks.TaskHistoryRecords");

            migrationBuilder.DropTable(
                name: "Tasks.TaskHistories");
        }
    }
}
