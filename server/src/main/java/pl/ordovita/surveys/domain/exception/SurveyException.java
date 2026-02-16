package pl.ordovita.surveys.domain.exception;

public class SurveyException extends RuntimeException{
    public SurveyException(String message) {
        super(message);
    }
    public SurveyException(String message, Throwable cause) {
        super(message, cause);
    }
}
