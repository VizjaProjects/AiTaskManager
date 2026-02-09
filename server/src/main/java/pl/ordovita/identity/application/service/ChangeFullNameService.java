package pl.ordovita.identity.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.application.port.in.ChangeFullNameUseCase;
import pl.ordovita.identity.domain.exception.UserException;
import pl.ordovita.identity.domain.model.user.User;
import pl.ordovita.identity.domain.port.CurrentUser;
import pl.ordovita.identity.domain.port.UserRepository;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class ChangeFullNameService implements ChangeFullNameUseCase {

    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    @Override
    public ChangeFullNameResult changeFullName(ChangeFullNameCommand command) {
        User user = userRepository.findById(currentUser.requireAuthenticated().id()).orElseThrow(() -> new UserException("User not found!"));

        if(!user.canLogin()) throw new UserException("User is deactivated");

        user.changeFullName(command.fullName());

        user.userDataUpdated();

        userRepository.save(user);

        return new ChangeFullNameResult(command.fullName(),user.getId().value(), Instant.now());
    }
}
