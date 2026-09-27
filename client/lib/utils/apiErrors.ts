/**
 * Best human-readable message from an axios error against the .NET API:
 * first validation error (ValidationProblem), then ProblemDetails detail, then fallback.
 */
export function getApiErrorMessage(error: any, fallback: string): string {
  const validationErrors = error?.response?.data?.errors;
  const firstValidationError =
    validationErrors && typeof validationErrors === "object"
      ? Object.values(validationErrors)
          .flat()
          .find((value) => typeof value === "string")
      : undefined;

  return (
    (firstValidationError as string | undefined) ??
    error?.response?.data?.detail ??
    error?.response?.data?.message ??
    fallback
  );
}
