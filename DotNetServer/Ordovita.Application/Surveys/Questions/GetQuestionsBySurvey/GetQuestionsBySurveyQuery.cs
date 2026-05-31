using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys;

namespace Ordovita.Application.Surveys.Questions.GetQuestionsBySurvey;

public sealed record GetQuestionsBySurveyQuery(Guid SurveyId) : IQuery<IReadOnlyList<QuestionDto>>;
