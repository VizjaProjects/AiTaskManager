package pl.ordovita.identity.infrastructure.jpa.passwordRestart;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import pl.ordovita.identity.infrastructure.jpa.user.UserEntity;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "password_restart")
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
public class PasswordRestartEntity {

    @Id
    @Column(nullable = false)
    private UUID id;

    @Column(nullable = false)
    private UUID token;

    @Column(nullable = false)
    private Instant expresAt;

    @Column(nullable = false)
    private boolean used;

    @Column(nullable = false, name = "previous_hashed_password")
    private String rawPassword;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Instant updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

}
