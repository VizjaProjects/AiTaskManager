package pl.ordovita.tasks.application.service;

import pl.ordovita.surveys.application.dto.UserResponseResult;
import pl.ordovita.tasks.application.port.in.GetCategoriesUseCase.CategoryResult;
import pl.ordovita.tasks.application.port.in.GetTaskStatusesUseCase.TaskStatusResult;

import java.util.List;
import java.util.Set;

final class AiPlanPromptBuilder {

    private AiPlanPromptBuilder() {}

    static String build(String userText,
                        Set<UserResponseResult> surveyAnswers,
                        List<CategoryResult> categories,
                        List<TaskStatusResult> statuses) {

        StringBuilder sb = new StringBuilder();

        sb.append("""
                Jesteś asystentem AI w aplikacji do zarządzania zadaniami.
                Użytkownik opisze w języku naturalnym, co ma do zrobienia.
                Twoim zadaniem jest przeanalizowanie tego tekstu i wygenerowanie ustrukturyzowanych zadań, wydarzeń w kalendarzu oraz nowych kategorii, jeśli to konieczne.
                Zastanów się głęboko nad każdym elementem — weź pod uwagę kontekst, priorytety i czas.

                ZASADY:
                - Twórz ZADANIA (tasks) dla rzeczy, które użytkownik musi wykonać (obowiązki, praca, zakupy itp.).
                - BARDZO WAŻNE: NIE twórz wydarzeń (events) i NIE przypisuj daty/czasu wykonania (dueDateTime) do zadania, chyba że użytkownik jasno i konkretnie określił, kiedy ma to nastąpić. Jeśli nie ma wyraźnego terminu, zostaw `dueDateTime` jako null i nie dodawaj wpisu do kalendarza!
                - Twórz WYDARZENIA (events) TYLKO dla aktywności, które mają z góry określony przedział czasowy w wypowiedzi (np. spotkania, wizyty).
                - Jeśli coś jest zadaniem i ma wyraźnie określony czas wykonania, stwórz ZARÓWNO zadanie (z przypisanym dueDateTime), JAK I wydarzenie.
                - Dla każdego zadania przypisz realistyczny szacowany czas trwania w minutach (`estimatedDuration`). Przemyśl to dokładnie.
                - Używaj istniejących kategorii użytkownika, gdy pasują do kontekstu. Użyj pola `categoryId` dla istniejących kategorii.
                - Jeśli ŻADNA z istniejących kategorii nie pasuje do zadania, utwórz NOWĄ: ustaw `categoryId` na null i podaj `newCategoryName` oraz `newCategoryColor` (kolor hex, np. "#8B5CF6").
                - Twórz nowe kategorie odważnie — jeśli zadania użytkownika obejmują różne, nowe obszary życia lub pracy, twórz dla nich odpowiednie kategorie.
                - Jako priorytet (`priority`) wybierz dokładnie jedną z wartości: CRITICAL, HIGH, MEDIUM, LOW.
                - Dla `statusId` wybierz z dostępnych ten status, który oznacza "Do zrobienia" (To Do) lub podobny.
                - Wykorzystaj poniższy kontekst z ankiet, aby lepiej zrozumieć pracę, nawyki i preferencje użytkownika. To KLUCZOWE informacje.
                - Wszystkie wartości daty i czasu muszą być w formacie ISO-8601 UTC (np. 2026-03-26T15:00:00Z).
                - Kontekst dzisiejszej daty jest zawarty w wiadomości użytkownika.

                """);

        if (!surveyAnswers.isEmpty()) {
            sb.append("KONTEKST ANKIETY UŻYTKOWNIKA (odpowiedzi z ankiet wdrożeniowych):\n");
            for (UserResponseResult answer : surveyAnswers) {
                sb.append("- Pytanie: ").append(answer.questionText())
                        .append("  Odpowiedź: ").append(answer.textAnswer()).append("\n");
            }
            sb.append("\n");
        }

        if (!categories.isEmpty()) {
            sb.append("DOSTĘPNE KATEGORIE (użyj categoryId, jeśli pasuje):\n");
            for (CategoryResult cat : categories) {
                sb.append("- id: ").append(cat.categoryId())
                        .append(", nazwa: \"").append(cat.name()).append("\"\n");
            }
            sb.append("\n");
        }

        if (!statuses.isEmpty()) {
            sb.append("DOSTĘPNE STATUSY (użyj statusId):\n");
            for (TaskStatusResult status : statuses) {
                sb.append("- id: ").append(status.statusId())
                        .append(", nazwa: \"").append(status.name()).append("\"\n");
            }
            sb.append("\n");
        }

        sb.append("""
                ODPOWIADAJ TYLKO poprawnym kodem JSON w poniższym, ścisłym formacie, bez żadnego dodatkowego tekstu ani znaczników formatowania:
                {
                  "tasks": [
                    {
                      "title": "string",
                      "description": "string lub null",
                      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
                      "categoryId": "uuid istniejącej kategorii, lub null jeśli tworzysz nową",
                      "newCategoryName": "string — nazwa nowej kategorii, lub null jeśli używasz istniejącej",
                      "newCategoryColor": "kolor hex dla nowej kategorii, lub null jeśli używasz istniejącej",
                      "statusId": "uuid",
                      "estimatedDuration": liczba_w_minutach,
                      "dueDateTime": "format ISO-8601 lub null"
                    }
                  ],
                  "events": [
                    {
                      "title": "string",
                      "startDateTime": "format ISO-8601",
                      "endDateTime": "format ISO-8601",
                      "allDay": false
                    }
                  ]
                }

                """);

        sb.append("TEKST UŻYTKOWNIKA:\n").append(userText);

        return sb.toString();
    }
}