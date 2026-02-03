package pl.ordovita.identity.application.exception;

public class RegisterException extends RuntimeException {
    public RegisterException(String message) {
        super(message);
    }

    public RegisterException(String message, Throwable cause) {
        super(message, cause);
    }
}
