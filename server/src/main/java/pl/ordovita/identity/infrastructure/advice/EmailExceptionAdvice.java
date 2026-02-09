package pl.ordovita.identity.infrastructure.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pl.ordovita.identity.application.exception.EmailVerification;
import pl.ordovita.identity.domain.exception.EmailException;
import pl.ordovita.identity.domain.exception.EmailVerificationException;

import java.net.URI;
import java.time.Instant;

@RestControllerAdvice
public class EmailExceptionAdvice {

    @ExceptionHandler(EmailException.class)
    public ProblemDetail handleEmailException(EmailException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Email Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/email-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "EMAIL");
        return problemDetail;
    }

    @ExceptionHandler(EmailVerificationException.class)
    public ProblemDetail handleEmailVerificationException(EmailVerificationException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Email Verification Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/email-verification-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "EMAIL");
        return problemDetail;
    }

    @ExceptionHandler(EmailVerification.class)
    public ProblemDetail handleEmailVerificationApplicationException(EmailVerification ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage()
        );
        problemDetail.setTitle("Email Verification Process Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/email-verification-process-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "EMAIL");
        return problemDetail;
    }
}