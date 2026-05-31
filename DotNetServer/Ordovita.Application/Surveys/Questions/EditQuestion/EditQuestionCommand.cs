using Ordovita.Application.Common.Cqrs;

namespace Ordovita.Application.Surveys.Questions.EditQuestion;

public sealed record EditQuestionCommand(
    Guid QuestionId,
    string QuestionText,
    bool IsRequired,
    string Hint) : ICommand<EditQuestionResult>;

public sealed record EditQuestionResult(Guid QuestionId, DateTime UpdatedAt);
