package pl.ordovita.tasks.infrastructure.adapter.aiStatistic;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import pl.ordovita.identity.domain.model.user.UserId;
import pl.ordovita.tasks.domain.model.aiStatistic.AiStatistic;
import pl.ordovita.tasks.domain.model.aiStatistic.AiStatisticId;
import pl.ordovita.tasks.domain.port.AiStatisticRepository;
import pl.ordovita.tasks.infrastructure.jpa.aiStatistic.AiStatisticJpaRepository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class AiStatisticRepositoryAdapter implements AiStatisticRepository {

    private final AiStatisticJpaRepository aiStatisticJpaRepository;

    @Override
    public AiStatistic save(AiStatistic aiStatistic) {
        return AiStatisticEntityMapper.toDomain(
                aiStatisticJpaRepository.save(AiStatisticEntityMapper.from(aiStatistic)));
    }

    @Override
    public Optional<AiStatistic> findById(AiStatisticId id) {
        return aiStatisticJpaRepository.findById(id.value())
                .map(AiStatisticEntityMapper::toDomain);
    }

    @Override
    public List<AiStatistic> findAllByUserId(UserId userId) {
        return aiStatisticJpaRepository.findAllByUserId(userId.value()).stream()
                .map(AiStatisticEntityMapper::toDomain)
                .toList();
    }

    @Override
    public void delete(AiStatistic aiStatistic) {
        aiStatisticJpaRepository.delete(AiStatisticEntityMapper.from(aiStatistic));
    }
}
