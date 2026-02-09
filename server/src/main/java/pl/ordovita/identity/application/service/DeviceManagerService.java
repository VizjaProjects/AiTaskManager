package pl.ordovita.identity.application.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import nl.basjes.parse.useragent.UserAgent;
import nl.basjes.parse.useragent.UserAgentAnalyzer;
import org.springframework.stereotype.Service;
import pl.ordovita.identity.application.port.in.DeviceManagerUseCase;

@Service
@AllArgsConstructor
public class DeviceManagerService implements DeviceManagerUseCase {

    private final UserAgentAnalyzer userAgentAnalyzer;

    public String getClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-FORWARDED-FOR");
        if (forwardedFor != null && !forwardedFor.isEmpty()) {
            return forwardedFor.split(",")[0];
        }

        return request.getRemoteAddr();
    }


    public String parseDeviceName(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        UserAgentAnalyzer agentAnalyzer = UserAgentAnalyzer.newBuilder().hideMatcherLoadStats().withCache(10000).build();

        UserAgent agent = agentAnalyzer.parse(userAgent);

        return String.format("%s %s on %s",
                agent.getValue("DeviceClass"),
                agent.getValue("AgentNameVersion"),
                agent.getValue("OperatingSystemNameVersion"));
    }
}
