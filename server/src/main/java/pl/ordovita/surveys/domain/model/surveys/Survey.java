package pl.ordovita.surveys.domain.model.surveys;

import pl.ordovita.surveys.domain.exception.SurveyException;

import java.time.Instant;

public class Survey {
    
    private final SurveyId id;
    private String title;
    private String description;
    private final Instant createdAt;
    private Instant updatedAt;
    private boolean isVisible;

    public Survey(SurveyId id, String title, String description, Instant createdAt, Instant updatedAt, boolean isVisible) {
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
        this.isVisible = isVisible;
    }

    public static Survey create(String title, String description) {
        return new Survey(SurveyId.generate(), title, description, Instant.now(), Instant.now(), false);
    }

    public void changeVisibility(boolean isVisible) {
        if(isVisible == this.isVisible) throw new SurveyException("Survey visible status cannot be same as previous status");
        this.isVisible = isVisible;
        this.updatedAt = Instant.now();
    }

    public Survey editSurveyTitleAndDescription(String title, String description){
        this.title = title;
        this.description = description;
        this.updatedAt = Instant.now();

        return this;
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

    public boolean isVisible() {
        return isVisible;
    }
}
