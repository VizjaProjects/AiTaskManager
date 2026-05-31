using Ordovita.Application.Common.Cqrs;

namespace Ordovita.Application.Surveys.DeleteSurvey;

public sealed record DeleteSurveyCommand(Guid SurveyId) : ICommand<Unit>;