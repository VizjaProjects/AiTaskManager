using Ordovita.Application.Common.Cqrs;
using Ordovita.Domain.Surveys.port;

namespace Ordovita.Application.Surveys.Questions.GetQuestionOptions;

public sealed record GetQuestionOptionsQuery(Guid QuestionId) : IQuery<IReadOnlyList<QuestionOptionDto>>;
