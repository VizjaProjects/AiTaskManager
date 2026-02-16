package pl.ordovita.surveys.domain.exception;

public class UserResponseException extends RuntimeException {
    public UserResponseException(String message) {
        super(message);
    }
    public UserResponseException(String message, Throwable cause) {
        super(message, cause);
    }
}
