using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordovita.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixSurveyIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Survey.UserResponses_QuestionId",
                table: "Survey.UserResponses");

            migrationBuilder.DropIndex(
                name: "IX_Survey.UserResponses_UserId",
                table: "Survey.UserResponses");

            migrationBuilder.DropIndex(
                name: "IX_Survey.Questions_SurveyId",
                table: "Survey.Questions");

            migrationBuilder.CreateIndex(
                name: "IX_Survey.UserResponses_UserId_QuestionId",
                table: "Survey.UserResponses",
                columns: new[] { "UserId", "QuestionId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Survey.Questions_SurveyId",
                table: "Survey.Questions",
                column: "SurveyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Survey.UserResponses_UserId_QuestionId",
                table: "Survey.UserResponses");

            migrationBuilder.DropIndex(
                name: "IX_Survey.Questions_SurveyId",
                table: "Survey.Questions");

            migrationBuilder.CreateIndex(
                name: "IX_Survey.UserResponses_QuestionId",
                table: "Survey.UserResponses",
                column: "QuestionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Survey.UserResponses_UserId",
                table: "Survey.UserResponses",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Survey.Questions_SurveyId",
                table: "Survey.Questions",
                column: "SurveyId",
                unique: true);
        }
    }
}
