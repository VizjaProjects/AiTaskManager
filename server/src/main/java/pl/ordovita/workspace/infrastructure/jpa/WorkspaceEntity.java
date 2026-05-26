package pl.ordovita.workspace.infrastructure.jpa;

import jakarta.persistence.*;
import lombok.*;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "worksapce_worksapce")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class WorkspaceEntity {

    @Id
    @Column(updatable = false,nullable = false,unique = true)
    private UUID id;

    private String workspaseName;

    @ManyToMany(fetch = FetchType.LAZY)
    private Set<UserEntity> assignedUsers;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private UserEntity createdBy;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;
}
