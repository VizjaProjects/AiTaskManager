using Ordovita.Application.Common.Cqrs;

namespace Ordovita.Application.Surveys.Questions.DeleteQuestion;

public sealed record DeleteQuestionCommand(Guid QuestionId) : ICommand<DeleteQuestionResult>;

public sealed record DeleteQuestionResult(Guid QuestionId, DateTime UpdatedAt);
