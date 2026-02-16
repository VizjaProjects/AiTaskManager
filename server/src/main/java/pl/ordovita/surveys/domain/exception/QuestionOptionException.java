package pl.ordovita.surveys.domain.exception;

public class QuestionOptionException extends RuntimeException {
    public QuestionOptionException(String message, Throwable cause) {
        super(message, cause);
    }
    public QuestionOptionException(String message) {
        super(message);
    }
}
