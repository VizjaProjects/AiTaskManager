package pl.ordovita.workspace.infrastructure.adapter;

import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;
import pl.ordovita.workspace.domain.model.Workspace;
import pl.ordovita.workspace.domain.model.WorkspaceId;
import pl.ordovita.workspace.infrastructure.jpa.WorkspaceEntity;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

public class WorkspaceEntityMapper {

    public static WorkspaceEntity from(Workspace workspace) {
        UserEntity userEntity = new UserEntity();
        userEntity.setId(workspace.getId().value());

        return WorkspaceEntity.builder().id(workspace.getId().value()).workspaseName(workspace.getWorkspaceName()).assignedUsers(
                workspace.getAssignedUsers() != null ? workspace.getAssignedUsers().stream().map(user -> UserEntity.builder().id(
                        user.value()).build()).collect(Collectors.toSet()) : null).createdBy(userEntity).createdAt(
                workspace.getCreatedAt()).updatedAt(workspace.getUpdatedAt()).build();
    }

    public static Workspace toDomain(WorkspaceEntity workspaceEntity) {
        if (workspaceEntity == null) {
            return null;
        }

        Set<UserId> users = workspaceEntity.getAssignedUsers() != null ? workspaceEntity.getAssignedUsers().stream().map(
                u -> new UserId(u.getId())).collect(Collectors.toSet()) : new HashSet<>();

        return new Workspace(new WorkspaceId(workspaceEntity.getId()),
                users,
                workspaceEntity.getWorkspaseName(),
                new UserId(workspaceEntity.getCreatedBy().getId()),
                workspaceEntity.getCreatedAt(),
                workspaceEntity.getUpdatedAt());
    }
}
