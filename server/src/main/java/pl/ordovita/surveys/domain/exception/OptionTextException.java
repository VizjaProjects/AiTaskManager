package pl.ordovita.surveys.domain.exception;

public class OptionTextException extends RuntimeException{
    public OptionTextException(String message) {
        super(message);
    }
    public OptionTextException(String message, Throwable cause) {
        super(message, cause);
    }
}
