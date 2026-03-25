package pl.ordovita.tasks.domain.exception;

public class TaskStatusException extends RuntimeException {
    public TaskStatusException(String message) {
        super(message);
    }
    public TaskStatusException(String message, Throwable cause) {
        super(message, cause);
    }
}
