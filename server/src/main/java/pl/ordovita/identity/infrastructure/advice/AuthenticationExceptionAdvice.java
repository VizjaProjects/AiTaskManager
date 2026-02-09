package pl.ordovita.identity.infrastructure.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pl.ordovita.identity.domain.exception.PasswordException;
import pl.ordovita.identity.domain.exception.PasswordRestartException;
import pl.ordovita.identity.domain.exception.TokenException;

import java.net.URI;
import java.time.Instant;

@RestControllerAdvice
public class AuthenticationExceptionAdvice {

    @ExceptionHandler(TokenException.class)
    public ProblemDetail handleTokenException(TokenException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
        problemDetail.setTitle("Token Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/token-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "AUTHENTICATION");
        return problemDetail;
    }

    @ExceptionHandler(PasswordException.class)
    public ProblemDetail handlePasswordException(PasswordException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problemDetail.setTitle("Password Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/password-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "AUTHENTICATION");
        return problemDetail;
    }

    @ExceptionHandler(PasswordRestartException.class)
    public ProblemDetail handlePasswordRestartException(PasswordRestartException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problemDetail.setTitle("Password Reset Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/password-reset-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "AUTHENTICATION");
        return problemDetail;
    }
}