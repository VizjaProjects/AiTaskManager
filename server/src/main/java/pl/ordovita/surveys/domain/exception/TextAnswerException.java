package pl.ordovita.surveys.domain.exception;

public class TextAnswerException extends RuntimeException {
    public TextAnswerException(String message) {
        super(message);
    }
    public TextAnswerException(String message, Throwable cause) {
        super(message, cause);
    }
}
