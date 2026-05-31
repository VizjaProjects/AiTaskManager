using Ordovita.Application.Common.Cqrs;

namespace Ordovita.Application.Surveys.CreateSurvey;

public sealed record CreateSurveyCommand(string Title, string Description) : ICommand<CreateSurveyResult>;