package pl.ordovita.identity.application.exception;

public class EmailVerification extends RuntimeException{
    public EmailVerification(String message) {
        super(message);
    }
    public EmailVerification(String message, Throwable cause) {
        super(message, cause);
    }
}
