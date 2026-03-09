package pl.ordovita.surveys.infrastructure.jpa.questionOption;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface QuestionOptionJpaRepository extends JpaRepository<QuestionOptionEntity, UUID> {

    @Query("""
            FROM QuestionOptionEntity qo
                        WHERE qo.questionId.id = :questionID
                        AND qo.questionId.questionType = "List"
            """)
    List<QuestionOptionEntity> findAllByQuestionId(@Param("questionID") UUID questionId);
}
