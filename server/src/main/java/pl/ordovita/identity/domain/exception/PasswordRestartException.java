package pl.ordovita.identity.domain.exception;

public class PasswordRestartException extends RuntimeException {
    public PasswordRestartException(String message) {
        super(message);
    }

    public PasswordRestartException(String message, Throwable cause) {
        super(message, cause);
    }

}
