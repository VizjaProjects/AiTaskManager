using System.Globalization;
using System.Text;
using Ordovita.Application.Surveys.GetUserAnswers;
using Ordovita.Domain.Tasks;

namespace Ordovita.Application.Abstraction.Llm;

public static class LlmPlanPromptBuilder
{
    public static string Build(string userText,
        IReadOnlyList<SurveyWithAnswersDto> surveyAnswers,
        IReadOnlyList<TaskCategory> categories,
        IReadOnlyList<WorkTaskStatus> statuses,
        DateTimeOffset nowInUserZone)
    {
        var sb = new StringBuilder();

        sb.Append("""
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

                  === WAŻNE: OBLICZANIE DAT WZGLĘDNYCH ===

                  Gdy użytkownik podaje datę względną (np. "w poniedziałek", "we wtorek", "w piątek"):
                  1. Sprawdź AKTUALNY CZAS podany poniżej — ustal dzień tygodnia.
                  2. Oblicz, ile dni dzieli aktualny dzień od podanego dnia tygodnia (ZAWSZE w przód, nigdy wstecz).
                     - Jeśli dziś jest środa, a użytkownik mówi "w poniedziałek" → to najbliższy poniedziałek = za 5 dni.
                     - Jeśli dziś jest poniedziałek, a użytkownik mówi "w poniedziałek" → to NASTĘPNY poniedziałek = za 7 dni.
                  3. Dodaj obliczoną liczbę dni do aktualnej daty — to jest wynik.
                  4. ZAWSZE zweryfikuj wynik: sprawdź, czy obliczona data faktycznie wypada w podany dzień tygodnia.
                     Jeśli nie — przelicz ponownie.

                  """);

        sb.Append("AKTUALNY CZAS: ")
            .Append(nowInUserZone.ToString("yyyy-MM-ddTHH:mm:sszzz", CultureInfo.InvariantCulture))
            .Append(" (")
            .Append(nowInUserZone.ToString("dddd", CultureInfo.InvariantCulture))
            .Append(")\n\n");

        if (surveyAnswers.Count > 0)
        {
            sb.Append("KONTEKST ANKIETY UŻYTKOWNIKA:\n");
            foreach (var answer in surveyAnswers)
                sb.Append("- Pytanie: ").Append(answer.QuestionText)
                    .Append(" → Odpowiedź: ").Append(answer.TextAnswer).Append('\n');
            sb.Append('\n');
        }

        sb.Append("DOSTĘPNE KATEGORIE (aktualnie: ").Append(categories.Count).Append("/20):\n");
        if (categories.Count > 0)
            foreach (var cat in categories)
                sb.Append("- id: ").Append(cat.Id)
                    .Append(", nazwa: \"").Append(cat.Name).Append("\"\n");
        else
            sb.Append("- (brak — utwórz nowe, gdy to konieczne)\n");
        sb.Append('\n');

        sb.Append("DOSTĘPNE STATUSY:\n");
        foreach (var status in statuses)
            sb.Append("- id: ").Append(status.Id)
                .Append(", nazwa: \"").Append(status.Name).Append("\"\n");
        sb.Append('\n');

        sb.Append("""
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

        sb.Append(userText);

        return sb.ToString();
    }
}