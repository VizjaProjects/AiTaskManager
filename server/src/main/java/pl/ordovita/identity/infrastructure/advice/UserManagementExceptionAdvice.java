package pl.ordovita.identity.infrastructure.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pl.ordovita.identity.application.exception.RegisterException;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.exception.UserSessionException;

import java.net.URI;
import java.time.Instant;

@RestControllerAdvice
public class UserManagementExceptionAdvice {

    @ExceptionHandler(UserException.class)
    public ProblemDetail handleUserException(UserException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("User Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/user-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "USER_MANAGEMENT");
        return problemDetail;
    }

    @ExceptionHandler(UserSessionException.class)
    public ProblemDetail handleUserSessionException(UserSessionException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNAUTHORIZED,
                ex.getMessage()
        );
        problemDetail.setTitle("User Session Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/session-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "USER_MANAGEMENT");
        return problemDetail;
    }

    @ExceptionHandler(RegisterException.class)
    public ProblemDetail handleRegisterException(RegisterException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Registration Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/registration-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "USER_MANAGEMENT");
        return problemDetail;
    }
}
