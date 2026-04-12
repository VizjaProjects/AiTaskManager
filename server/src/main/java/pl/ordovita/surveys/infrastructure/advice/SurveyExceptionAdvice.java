package pl.ordovita.surveys.infrastructure.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pl.ordovita.surveys.domain.exception.OptionTextException;
import pl.ordovita.surveys.domain.exception.QuestionException;
import pl.ordovita.surveys.domain.exception.QuestionOptionException;
import pl.ordovita.surveys.domain.exception.SurveyException;
import pl.ordovita.surveys.domain.exception.TextAnswerException;
import pl.ordovita.surveys.domain.exception.UserResponseException;

import java.net.URI;
import java.time.Instant;

@RestControllerAdvice
public class SurveyExceptionAdvice {

    @ExceptionHandler(SurveyException.class)
    public ProblemDetail handleSurveyException(SurveyException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Survey Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/survey-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "SURVEY");
        return problemDetail;
    }

    @ExceptionHandler(QuestionException.class)
    public ProblemDetail handleQuestionException(QuestionException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Question Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/question-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "SURVEY");
        return problemDetail;
    }

    @ExceptionHandler(QuestionOptionException.class)
    public ProblemDetail handleQuestionOptionException(QuestionOptionException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Question Option Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/question-option-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "SURVEY");
        return problemDetail;
    }

    @ExceptionHandler(OptionTextException.class)
    public ProblemDetail handleOptionTextException(OptionTextException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Option Text Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/option-text-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "SURVEY");
        return problemDetail;
    }

    @ExceptionHandler(TextAnswerException.class)
    public ProblemDetail handleTextAnswerException(TextAnswerException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Text Answer Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/text-answer-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "SURVEY");
        return problemDetail;
    }

    @ExceptionHandler(UserResponseException.class)
    public ProblemDetail handleUserResponseException(UserResponseException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("User Response Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/user-response-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "SURVEY");
        return problemDetail;
    }
}
