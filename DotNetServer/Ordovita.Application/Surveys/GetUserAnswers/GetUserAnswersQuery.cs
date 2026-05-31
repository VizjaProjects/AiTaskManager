using Ordovita.Application.Common.Cqrs;
using Ordovita.Application.Surveys.GetUserAnswers;

namespace Ordovita.Application.Surveys.GetUserAnswers;

public sealed record GetUserAnswersQuery : IQuery<IReadOnlyList<SurveyWithAnswersDto>>;