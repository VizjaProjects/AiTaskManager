using Ordovita.Domain.Common;

namespace Ordovita.Api.Common;

public static class ErrorExtensions
{
    public static IResult ToProblem(this Error error)
    {
        return error.Type switch
        {
            ErrorType.NotFound => Results.Problem(statusCode: 404, title: error.Code, detail: error.Description),
            ErrorType.Validation => Results.Problem(statusCode: 400, title: error.Code, detail: error.Description),
            ErrorType.Conflict => Results.Problem(statusCode: 409, title: error.Code, detail: error.Description),
            ErrorType.Unauthorized => Results.Problem(statusCode: 401, title: error.Code, detail: error.Description),
            _ => Results.Problem(statusCode: 500, title: error.Code, detail: error.Description)
        };
    }
}