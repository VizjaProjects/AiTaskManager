package pl.ordovita.identity.application.port.in;

public interface LogoutUseCase {

    record LogoutCommand(String refreshToken){}

    void logout(LogoutCommand command);
}
