using Ordovita.Domain.Common;

namespace Ordovita.Domain.Surveys.Exception;

public class SurveyException
{
    public static readonly Error MissingTitle =
        Error.Validation("Survey.MissingTitle", "Title is required.");

    public static readonly Error MissingDescription =
        Error.Conflict("Survey.MissingDescription", "Description is required.");

    public static readonly Error NotFound =
        Error.NotFound("Survey.NotFound", "Survey was not found.");

    public static readonly Error AlreadyVisable =
        Error.NotFound("Survey.AlreadyVisable", "Survey is already visible.");

    public static readonly Error AlreadyNotVisable =
        Error.NotFound("Survey.AlreadyNotVisable", "Survey is not already visible.");
}