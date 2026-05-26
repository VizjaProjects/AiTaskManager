package pl.ordovita.workspace.domain.model;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.shared.domain.event.DomainEvent;
import pl.ordovita.shared.domain.event.DomainEventPublisher;
import pl.ordovita.workspace.domain.event.WorkspaceAddUserEvent;
import pl.ordovita.workspace.domain.event.WorkspaceRemoveUserEvent;
import pl.ordovita.workspace.domain.exception.WorkspaceException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class Workspace {

    private final WorkspaceId id;
    private final String workspaceName;
    private final Set<UserId> assignedUsers;
    private final UserId createdBy;
    private final Instant createdAt;
    private Instant updatedAt;
    private final List<DomainEvent> domainEvents = new ArrayList<>();



    public Workspace(WorkspaceId id, Set<UserId> assignedUsers, String workspaceName, UserId createdBy, Instant createdAt, Instant updatedAt) {
        if (id == null) throw new WorkspaceException("Worksapce id must not be null");
        if (assignedUsers == null) throw new WorkspaceException("Worksapce assignedUsers must not be null");
        if (workspaceName == null) throw new WorkspaceException("Worksapce workspaceName must not be null");
        if (createdBy == null) throw new WorkspaceException("Worksapce createdBy must not be null");
        if (createdAt == null) throw new WorkspaceException("Worksapce createdAt must not be null");
        if (updatedAt == null) throw new WorkspaceException("Worksapce updatedAt must not be null");
        this.id = id;
        this.assignedUsers = assignedUsers;
        this.workspaceName = workspaceName;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static Workspace createWorkspace(Set<UserId> userIdSet, String workspaceName, UserId createdBy){

        Workspace workspace = new Workspace(WorkspaceId.generate(), userIdSet, workspaceName, createdBy, Instant.now(), Instant.now());
        workspace.addUserToWorksapce(createdBy);
        return workspace;
    }

    public void addUserToWorksapce(UserId userId) {
        if (userId == null) throw new WorkspaceException("userId cannot be null");
        this.assignedUsers.add(userId);
        if(userId.value().equals(this.createdBy.value())) {
            this.registerEvent(new WorkspaceAddUserEvent(id.value(),userId.value()));
        }
        updated();
    }

    public void removeUserFromWorksapce(UserId userId) {
        if (userId == null) throw new WorkspaceException("userId cannot be null");
        if(this.assignedUsers.contains(userId)) throw new WorkspaceException("User is already assigned to worksapce");
        this.assignedUsers.remove(userId);
        this.registerEvent(new WorkspaceRemoveUserEvent(id.value(),userId.value()));
        updated();
    }


    private void updated() {
        this.updatedAt = Instant.now();
    }

    private void registerEvent(DomainEvent event) {
        this.domainEvents.add(event);
    }

    private List<DomainEvent> getDomainEvents() {
        return List.copyOf(domainEvents);
    }

    public void publish(DomainEventPublisher domainEventPublisher) {
        this.getDomainEvents().forEach(domainEventPublisher::publish);
        this.domainEvents.clear();
    }

    public WorkspaceId getId() {
        return id;
    }

    public String getWorkspaceName() {
        return workspaceName;
    }

    public Set<UserId> getAssignedUsers() {
        return assignedUsers;
    }

    public UserId getCreatedBy() {
        return createdBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
