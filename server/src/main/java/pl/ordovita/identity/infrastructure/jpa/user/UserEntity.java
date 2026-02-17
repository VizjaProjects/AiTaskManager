package pl.ordovita.identity.infrastructure.jpa.user;

import jakarta.persistence.*;
import lombok.*;
import pl.ordovita.identity.domain.model.user.Role;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "identity_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserEntity {

    @Id
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    private Instant lastLoginAt;

    @Column(nullable = false)
    private boolean isEnabled;

    private boolean emailVerified;

    private Instant emailVerifiedAt;

}
