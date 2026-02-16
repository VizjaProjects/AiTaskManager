package pl.ordovita.surveys.domain.exception;

public class QuestionException extends RuntimeException {
    public QuestionException(String message, Throwable cause) {
        super(message, cause);
    }
    public QuestionException(String message) {
        super(message);
    }
}
