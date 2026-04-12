package pl.ordovita.tasks.infrastructure.advice;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import pl.ordovita.shared.infrastructure.ai.AiClientException;
import pl.ordovita.tasks.domain.exception.AiStatisticException;
import pl.ordovita.tasks.domain.exception.CalendarException;
import pl.ordovita.tasks.domain.exception.CategoryException;
import pl.ordovita.tasks.domain.exception.EventException;
import pl.ordovita.tasks.domain.exception.TaskException;
import pl.ordovita.tasks.domain.exception.TaskStatusException;

import java.net.URI;
import java.time.Instant;

@RestControllerAdvice
public class TaskExceptionAdvice {

    @ExceptionHandler(TaskException.class)
    public ProblemDetail handleTaskException(TaskException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Task Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/task-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "TASK");
        return problemDetail;
    }

    @ExceptionHandler(TaskStatusException.class)
    public ProblemDetail handleTaskStatusException(TaskStatusException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Task Status Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/task-status-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "TASK");
        return problemDetail;
    }

    @ExceptionHandler(CategoryException.class)
    public ProblemDetail handleCategoryException(CategoryException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Category Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/category-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "TASK");
        return problemDetail;
    }

    @ExceptionHandler(CalendarException.class)
    public ProblemDetail handleCalendarException(CalendarException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Calendar Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/calendar-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "TASK");
        return problemDetail;
    }

    @ExceptionHandler(EventException.class)
    public ProblemDetail handleEventException(EventException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("Event Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/event-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "TASK");
        return problemDetail;
    }

    @ExceptionHandler(AiStatisticException.class)
    public ProblemDetail handleAiStatisticException(AiStatisticException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                ex.getMessage()
        );
        problemDetail.setTitle("AI Statistic Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/ai-statistic-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "AI");
        return problemDetail;
    }

    @ExceptionHandler(AiClientException.class)
    public ProblemDetail handleAiClientException(AiClientException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.SERVICE_UNAVAILABLE,
                ex.getMessage()
        );
        problemDetail.setTitle("AI Service Error");
        problemDetail.setType(URI.create("https://api.ordovita.pl/errors/ai-client-error"));
        problemDetail.setProperty("timestamp", Instant.now());
        problemDetail.setProperty("category", "AI");
        return problemDetail;
    }
}
