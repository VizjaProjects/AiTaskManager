using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordovita.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLlmStatistic : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "LlmStatistic.LlmStatistics",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    Prompt = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    OutputTokenCount = table.Column<int>(type: "int", nullable: false),
                    InputTokenCount = table.Column<int>(type: "int", nullable: false),
                    TotalTokenCount = table.Column<int>(type: "int", nullable: false),
                    RequestedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    RequestedBy = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    RequestType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LlmStatistic.LlmStatistics", x => x.Id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_LlmStatistic.LlmStatistics_RequestedAt",
                table: "LlmStatistic.LlmStatistics",
                column: "RequestedAt");

            migrationBuilder.CreateIndex(
                name: "IX_LlmStatistic.LlmStatistics_RequestedBy",
                table: "LlmStatistic.LlmStatistics",
                column: "RequestedBy");

            migrationBuilder.CreateIndex(
                name: "IX_LlmStatistic.LlmStatistics_RequestType",
                table: "LlmStatistic.LlmStatistics",
                column: "RequestType");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "LlmStatistic.LlmStatistics");
        }
    }
}
