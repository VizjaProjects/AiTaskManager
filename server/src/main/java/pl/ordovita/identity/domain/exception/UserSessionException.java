package pl.ordovita.identity.domain.exception;

public class UserSessionException extends RuntimeException {
    public UserSessionException(String message) {
        super(message);
    }

    public UserSessionException(String message, Throwable cause) {
        super(message, cause);
    }
}
