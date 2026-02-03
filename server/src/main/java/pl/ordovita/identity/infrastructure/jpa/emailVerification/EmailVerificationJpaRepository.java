package pl.ordovita.identity.infrastructure.jpa.emailVerification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

public interface EmailVerificationJpaRepository extends JpaRepository<EmailVerificationEntity, UUID> {

    @Query("""
            SELECT ev FROM EmailVerificationEntity ev
            WHERE ev.user.isEnabled = true
            AND ev.user.id = :userId
            """)
    Optional<EmailVerificationEntity> findActiveByUserId(@Param("userId") UUID userId);

    Optional<EmailVerificationEntity> findByUserIdAndCode(UUID userId, String code);

    @Modifying
    @Transactional
    @Query("DELETE FROM EmailVerificationEntity ev WHERE ev.expiresAt < CURRENT_TIMESTAMP")
    void deleteExpired();

}
