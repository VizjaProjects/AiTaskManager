package pl.ordovita.tasks.application.service;

import pl.ordovita.surveys.application.dto.UserResponseResult;
import pl.ordovita.tasks.application.port.in.GetCategoriesUseCase.CategoryResult;
import pl.ordovita.tasks.application.port.in.GetTaskStatusesUseCase.TaskStatusResult;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;

final class AiPlanPromptBuilder {

    private AiPlanPromptBuilder() {}

    static String build(String userText,
                        Set<UserResponseResult> surveyAnswers,
                        List<CategoryResult> categories,
                        List<TaskStatusResult> statuses,
                        ZonedDateTime now) {


        StringBuilder sb = new StringBuilder();

        sb.append("""
                Jesteś asystentem AI w aplikacji do zarządzania zadaniami.
                Użytkownik opisze w języku naturalnym, co ma do zrobienia.
                Twoim zadaniem jest przeanalizowanie tego tekstu i wygenerowanie ustrukturyzowanych zadań, wydarzeń w kalendarzu oraz nowych kategorii, jeśli to konieczne.
                Zastanów się głęboko nad każdym elementem — weź pod uwagę kontekst, priorytety i czas.

                === KLUCZOWE ROZRÓŻNIENIE: ZADANIE vs WYDARZENIE ===

                ZADANIE (task) = coś, co użytkownik musi ZROBIĆ (obowiązek, praca, zakupy, nauka itp.).
                WYDARZENIE (event) = coś, na co użytkownik musi się STAWIĆ lub co TRWA w określonym przedziale czasowym i NIE jest zadaniem do wykonania (spotkanie, wizyta u lekarza, koncert, wykład).

                === ZASADY TWORZENIA ZADAŃ ===

                1. Twórz ZADANIA dla wszystkich rzeczy, które użytkownik musi wykonać.
                2. Pole `dueDateTime` ustawiaj TYLKO wtedy, gdy użytkownik wyraźnie podał termin lub czas wykonania.
                   - Brak konkretnego terminu → `dueDateTime` = null.
                   - WAŻNE: Gdy zadanie ma `dueDateTime`, system AUTOMATYCZNIE tworzy powiązany wpis w kalendarzu.
                     NIE dodawaj tego samego elementu do tablicy `events` — to spowoduje duplikat!
                3. Przypisz realistyczny szacowany czas trwania w minutach (`estimatedDuration`).
                   System użyje tej wartości do obliczenia czasu zakończenia wpisu w kalendarzu (start + estimatedDuration).
                4. Jako priorytet (`priority`) wybierz: CRITICAL, HIGH, MEDIUM lub LOW.
                5. Dla `statusId` wybierz z dostępnych poniżej ten, który oznacza "Do zrobienia" / "To Do" lub podobny.

                === ZASADY TWORZENIA WYDARZEŃ ===

                1. Twórz WYDARZENIA wyłącznie dla aktywności, które:
                   - mają z góry określony przedział czasowy (start i koniec),
                   - NIE są zadaniami do wykonania, lecz czymś, w czym użytkownik uczestniczy.
                   Przykłady: spotkanie o 14:00, wizyta u dentysty, konferencja, mecz.
                2. NIE twórz wydarzeń dla rzeczy, które są zadaniami z terminem — te obsłuży automatycznie pole `dueDateTime` w zadaniu.
                3. Pole `allDay` ustaw na true tylko dla wydarzeń całodniowych (np. "urodziny", "dzień wolny").

                === KATEGORIE ===

                - Używaj istniejących kategorii użytkownika, gdy pasują. Wpisz odpowiedni `categoryId`.
                - Jeśli ŻADNA istniejąca kategoria nie pasuje, utwórz nową: ustaw `categoryId` na null i podaj `newCategoryName` oraz `newCategoryColor` (kolor hex, np. "#8B5CF6").
                - Twórz nowe kategorie śmiało, jeśli zadania obejmują nowe obszary życia lub pracy.
                - Limit kategorii wynosi 20. Jeśli użytkownik osiągnął limit, dopasuj zadanie do najbliższej istniejącej kategorii.

                === DODATKOWE ZASADY ===

                - Wykorzystaj kontekst z ankiet użytkownika (poniżej), aby lepiej zrozumieć jego pracę, nawyki i preferencje.
                - Wszystkie daty i czasy w formacie ISO-8601 UTC (np. 2026-03-26T15:00:00Z).
                - Aktualny czas podany jest poniżej — używaj go do określania dat względnych ("jutro", "w piątek", "za tydzień").

                """);

        sb.append("AKTUALNY CZAS: ").append(now).append("\n\n");

        if (!surveyAnswers.isEmpty()) {
            sb.append("KONTEKST ANKIETY UŻYTKOWNIKA:\n");
            for (UserResponseResult answer : surveyAnswers) {
                sb.append("- Pytanie: ").append(answer.questionText())
                        .append(" → Odpowiedź: ").append(answer.textAnswer()).append("\n");
            }
            sb.append("\n");
        }

        if (!categories.isEmpty()) {
            sb.append("DOSTĘPNE KATEGORIE (aktualnie: ").append(categories.size()).append("/20):\n");
            for (CategoryResult cat : categories) {
                sb.append("- id: ").append(cat.categoryId())
                        .append(", nazwa: \"").append(cat.name()).append("\"\n");
            }
            sb.append("\n");
        }

        if (!statuses.isEmpty()) {
            sb.append("DOSTĘPNE STATUSY:\n");
            for (TaskStatusResult status : statuses) {
                sb.append("- id: ").append(status.statusId())
                        .append(", nazwa: \"").append(status.name()).append("\"\n");
            }
            sb.append("\n");
        }

        sb.append("""
                ODPOWIADAJ WYŁĄCZNIE poprawnym JSON-em w poniższym formacie. Bez dodatkowego tekstu, bez znaczników markdown:
                {
                  "tasks": [
                    {
                      "title": "string",
                      "description": "string lub null",
                      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
                      "categoryId": "uuid istniejącej kategorii lub null",
                      "newCategoryName": "string lub null",
                      "newCategoryColor": "hex lub null",
                      "statusId": "uuid",
                      "estimatedDuration": 30,
                      "dueDateTime": "ISO-8601 lub null"
                    }
                  ],
                  "events": [
                    {
                      "title": "string",
                      "startDateTime": "ISO-8601",
                      "endDateTime": "ISO-8601",
                      "allDay": false
                    }
                  ]
                }

                TEKST UŻYTKOWNIKA:
                """);

        sb.append(userText);

        return sb.toString();
    }
}