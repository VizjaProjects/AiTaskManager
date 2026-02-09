package pl.ordovita.identity.application.port.in;

import jakarta.servlet.http.HttpServletRequest;

public interface DeviceManagerUseCase {

    String getClientIp(HttpServletRequest request);
    String parseDeviceName(HttpServletRequest request);
}
