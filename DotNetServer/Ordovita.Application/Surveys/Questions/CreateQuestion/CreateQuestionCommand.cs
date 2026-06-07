using Ordovita.Application.Common.Cqrs;

namespace Ordovita.Application.Surveys.Questions.CreateQuestion;

public sealed record CreateQuestionCommand(
    Guid SurveyId,
    string QuestionText,
    string QuestionType,
    IReadOnlyList<string> OptionTextValue,
    bool IsRequired,
    string Hint) : ICommand<CreateQuestionResult>;

public sealed record CreateQuestionResult(Guid SurveyId, Guid QuestionId, DateTime CreatedAt);