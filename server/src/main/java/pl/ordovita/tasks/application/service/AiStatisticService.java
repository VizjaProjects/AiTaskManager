package pl.ordovita.tasks.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;
import pl.ordovita.tasks.application.port.in.CreateAiStatisticUseCase;
import pl.ordovita.tasks.application.port.in.DeleteAiStatisticUseCase;
import pl.ordovita.tasks.application.port.in.GetAiStatisticsUseCase;
import pl.ordovita.tasks.domain.exception.AiStatisticException;
import pl.ordovita.tasks.domain.model.aiStatistic.AiStatistic;
import pl.ordovita.tasks.domain.model.aiStatistic.AiStatisticId;
import pl.ordovita.tasks.domain.port.AiStatisticRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiStatisticService implements CreateAiStatisticUseCase, GetAiStatisticsUseCase, DeleteAiStatisticUseCase {

    private final AiStatisticRepository aiStatisticRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    @Override
    public CreateAiStatisticResult createAiStatistic(CreateAiStatisticCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));
        AiStatistic statistic = AiStatistic.create(command.promptText(), command.inputTokens(), user.getId());
        aiStatisticRepository.save(statistic);
        return new CreateAiStatisticResult(statistic.getId().value(), statistic.getCreatedAt());
    }

    @Override
    public GetUserAiStatisticsResult getUserAiStatistics() {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));
        List<AiStatisticResult> statistics = aiStatisticRepository.findAllByUserId(user.getId()).stream()
                .map(s -> new AiStatisticResult(
                        s.getId().value(), s.getPromptText(), s.getInputTokens(),
                        s.getUserId().value(), s.getCreatedAt()))
                .toList();
        return new GetUserAiStatisticsResult(statistics);
    }

    @Override
    public void deleteAiStatistic(DeleteAiStatisticCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id())
                .orElseThrow(() -> new UserException("User not found"));
        AiStatisticId aiStatisticId = new AiStatisticId(command.aiStatisticId());
        AiStatistic statistic = aiStatisticRepository.findById(aiStatisticId)
                .orElseThrow(() -> new AiStatisticException("AiStatistic with id " + aiStatisticId + " not found"));
        if (!statistic.getUserId().equals(user.getId()))
            throw new AiStatisticException("AiStatistic does not belong to current user");
        aiStatisticRepository.delete(statistic);
    }
}
