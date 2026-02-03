package pl.ordovita.identity.domain.exception;

public class EmailVerificationException extends RuntimeException {
    public EmailVerificationException(String message) {
        super(message);
    }
    public EmailVerificationException(String message, Throwable cause) {
        super(message, cause);
    }
}
