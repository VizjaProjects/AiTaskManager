package pl.ordovita.notifications.domain;

public interface MailSender {
    void send(String toEmail, String subject, String body);

    String loadResourceAsString(String classpathLocation);

    String escapeHtml(String html);
}
