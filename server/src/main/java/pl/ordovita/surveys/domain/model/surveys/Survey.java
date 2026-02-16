package pl.ordovita.surveys.domain.model.surveys;

import pl.ordovita.surveys.domain.exception.SurveyException;

import java.time.Instant;

public class Survey {
    
    private final SurveyId id;
    private final String title;
    private final String description;
    private final Instant createdAt;
    private final Instant updatedAt;

    public Survey(SurveyId id, String title, String description, Instant createdAt, Instant updatedAt) {
        if (id == null) throw new SurveyException("Survey id cannot be null");
        if (title == null) throw new SurveyException("Title cannot be null");
        if (description == null) throw new SurveyException("Description cannot be null");
        if (createdAt == null) throw new SurveyException("CreatedAt cannot be null");
        if (updatedAt == null) throw new SurveyException("UpdatedAt cannot be null");
        this.id = id;
        this.title = title;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Survey create(String title, String description) {
        return new Survey(SurveyId.generate(), title, description, Instant.now(), Instant.now());
    }


    public SurveyId getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
