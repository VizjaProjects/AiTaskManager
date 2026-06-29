# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Cel tego pliku:** to jest „mózg projektu" dla AI. Czytasz go raz na starcie sesji i wiesz, *co gdzie jest* i *czego się spodziewać* — bez przeszukiwania całego repo. Jest wczytywany automatycznie przez Claude Code, więc trzymaj go aktualnym.

---

## 🔄 Protokół utrzymania (PRZECZYTAJ NAJPIERW)

Ten plik ma działać jak dobry Obsidian: zawsze aktualny, z linkami do źródeł.

**Po KAŻDYM ukończonym zadaniu zaktualizuj `CLAUDE.md`:**
1. Jeśli zmieniłeś architekturę, przepływ danych, konwencję lub dodałeś moduł/feature → zaktualizuj właściwą sekcję.
2. Dopisz wpis w [Changelog](#-changelog) (data + 1–2 zdania, co i gdzie).
3. Jeśli odkryłeś nieoczywistą pułapkę → dopisz ją do [Konwencje i pułapki](#-konwencje-i-pułapki).
4. Zaktualizuj `Last updated` na dole.
5. Nie duplikuj tego, co łatwo wywnioskować z kodu; zapisuj **wiedzę nieoczywistą** (decyzje, gotchas, „dlaczego tak").

Linki do plików podawaj względem roota repo, np. [client/app/(app)/calendar.tsx](client/app/%28app%29/calendar.tsx).

---

## 📍 Orientacja w 30 sekund

**Ordovita** — AI task & calendar manager. Monorepo: jeden frontend (Expo / React Native działający na **web + desktop Electron + native**) i jeden backend **.NET 10**.

- **Backend właściwy: [DotNetServer/](DotNetServer/)** (.NET 10, Clean Architecture + CQRS). To jest źródło prawdy.
- ⚠️ **[server/](server/) to MARTWY stary backend (Java/Gradle) — IGNORUJ go.** Nie edytuj, nie wnioskuj z niego. Cała logika serwerowa żyje w `DotNetServer`.
- **Frontend: [client/](client/)** — Expo Router, NativeWind (Tailwind), React Query, Zustand.
- Język UI: PL + EN (i18n). Kod/komentarze: mieszane PL/EN.

Spis treści:
- [Komendy](#-komendy)
- [Architektura frontendu](#-architektura-frontendu-client)
- [Architektura backendu](#-architektura-backendu-dotnetserver)
- [Auth i konfiguracja](#-auth-i-konfiguracja)
- [Konwencje i pułapki](#-konwencje-i-pułapki)
- [Mapa funkcji](#-mapa-funkcji-gdzie-co-jest)
- [Deployment / CI](#-deployment--ci)
- [Changelog](#-changelog)

---

## 🛠 Komendy

Working dir ma znaczenie — komendy frontu uruchamiaj w `client/`, backendu w `DotNetServer/`.

### Frontend ([client/](client/))
```bash
cd client
npm install --legacy-peer-deps   # CI używa `npm ci --legacy-peer-deps`
npm run web                      # Expo web (dev) — główny tryb do smoke-testów
npm start                        # Expo dev server (QR / native)
npm run android | npm run ios    # native
npm run desktop:dev              # Electron dev
npm run desktop:dist             # Electron build (Windows NSIS installer)
npm run desktop:dist:mac         # Electron build (macOS DMG, arm64)
```

**Typecheck:** `cd client && npx tsc --noEmit`
- ⚠️ **Nie ma skryptu `typecheck`/`lint` w package.json.**
- ⚠️ **Baseline ma ~22 błędy TS** z idiomów React-Native-Web (`dataSet`, `cursor`, `outlineStyle`) w istniejącym kodzie — TO NIE SĄ regresje. Weryfikuj zmiany przez porównanie liczby błędów do baseline (stash → tsc → pop), a nie „czy są zero błędów".

**Testy JS:** brak (nie ma jest/vitest). Weryfikacja = tsc + uruchomienie aplikacji. Funkcjonalność testuje zwykle użytkownik.

### Backend ([DotNetServer/](DotNetServer/))
```bash
cd DotNetServer
dotnet build                                  # cała solucja (DotNetServer.sln)
dotnet run --project Ordovita.Api             # uruchom API (port 8080)
dotnet test                                   # ⚠️ projekt Ordovita.Api.Tests jest PUSTY — brak testów
```
- **Migracje EF Core są aplikowane automatycznie przy starcie** (`db.Database.MigrateAsync()` w [Program.cs](DotNetServer/Ordovita.Api/Program.cs)). Nie trzeba `dotnet ef database update`.
- Nowa migracja: `dotnet ef migrations add <Name> --project Ordovita.Infrastructure --startup-project Ordovita.Api`.
- DB: MySQL (connection string w `.env` / `ConnectionStrings__Database`).
- Dokumentacja API (dev): Scalar UI + OpenAPI gdy `ASPNETCORE_ENVIRONMENT=Development`.

### Docker (cały stack)
```bash
docker compose -f docker-compose-development.yml up --build
# backend :8080, frontend :3000 (frontend czeka na healthcheck backendu /health)
```
Backend potrzebuje [DotNetServer/.env](DotNetServer/.env) (wzór: [.env.example](DotNetServer/.env.example)).

---

## 🎨 Architektura frontendu ([client/](client/))

Expo Router (file-based routing) + React Native Web. Jeden codebase → web, desktop (Electron), native.

### Routing
- [client/app/](client/app/) — trasy. Grupy: `(auth)` (login/register/itd.), `(app)` (zalogowany obszar).
- Główne ekrany w [client/app/(app)/](client/app/%28app%29/): `dashboard`, `tasks`, `calendar`, `notes`, `ai-task`, `statistics`, `surveys`, `workspaces`, `admin-*`, `profile`.
- Wejście: [client/app/_layout.tsx](client/app/_layout.tsx) (providers: React Query, stores, i18n).

### Warstwa danych (wzorzec do naśladowania)
1. **HTTP**: [client/lib/api/client.ts](client/lib/api/client.ts) — axios + interceptory. Base URL = `EXPO_PUBLIC_API_URL` → `window.origin` (web) → `http://localhost:8080`; prefix `/api/v1`. Auto-refresh tokenu na 401 (kolejkuje równoległe żądania).
2. **Moduły API**: [client/lib/api/](client/lib/api/) (`tasks`, `workspace`, `notes`, `identity`, `surveys`, `plan`, `admin`, `llmSettings`, `user`). [adapters.ts](client/lib/api/adapters.ts) mapuje DTO ↔ typy klienta.
3. **Hooki** (React Query): [client/lib/hooks/index.ts](client/lib/hooks/index.ts) — ~75 hooków (`useTasks`, `useEvents`, `useEditEvent`, `useNotes`, `useSetTaskAssignees`, …). To główny punkt wejścia do danych w komponentach.
4. **Typy**: [client/lib/types/index.ts](client/lib/types/index.ts) — `Task`, `CalendarEvent`, `Workspace`, `WorkspaceUser`, `Note`, request/response DTO.

### Stan globalny — Zustand ([client/lib/stores/](client/lib/stores/))
`useAuthStore`, `useWorkspaceStore` (aktywny workspace + `assignedUsers`/members), `useThemeStore` (dark/light), `useLlmSettingsSelectionStore`, `useAiPlanningRequestStore`.

### i18n ([client/lib/i18n/](client/lib/i18n/))
- Języki: **pl + en** ([config.ts](client/lib/i18n/config.ts)), domyślny `pl`. Słowniki płaskie (klucze `namespace.key`) w [translations.ts](client/lib/i18n/translations.ts).
- Użycie: `const t = useT(); t("tasks.filterStatus")`. Dodając tekst → dodaj klucz do **obu** języków.
- ⚠️ Wyjątek: [calendar.tsx](client/app/%28app%29/calendar.tsx) **nie używa i18n** — ma zaszyte stringi PL/EN. Trzymaj się stylu pliku.

### Design system
- NativeWind (Tailwind) z tokenami semantycznymi (Material-like) w [client/tailwind.config.js](client/tailwind.config.js): `bg-surface-container-*`, `text-on-surface`, `border-outline-variant`, `text-primary`, `font-headline/body/label`, itd. **Używaj tokenów, nie surowych kolorów**, poza miejscami gdzie liczy się dokładny hex (np. accent `#5b4ee0` light / `#9b8cff` dark).
- Komponenty: atomic design w [client/components/](client/components/) → `atoms/`, `molecules/`, `organisms/`.

### Edytor notatek — kluczowy wzorzec
- [client/components/organisms/notes/editorHtml.ts](client/components/organisms/notes/editorHtml.ts) to **jeden samodzielny dokument HTML** (contenteditable + JS) hostowany w `<iframe>` (web) i `react-native-webview` (native). Most host↔editor przez `postMessage` (JSON: `setContent`/`command`/`change`/`state`/…).
- Hosty: [RichTextEditor.web.tsx](client/components/organisms/notes/RichTextEditor.web.tsx) (iframe), [RichTextEditor.native.tsx](client/components/organisms/notes/RichTextEditor.native.tsx) (WebView).
- Treść notatki = `editor.innerHTML` (HTML). Funkcje edytora (formatowanie, slash-menu, checklisty, resize obrazków) dodaje się w JS wewnątrz `editorHtml.ts` — działają wtedy na wszystkich platformach naraz.

---

## 🧱 Architektura backendu ([DotNetServer/](DotNetServer/))

.NET 10, **Clean Architecture + CQRS**. 4 projekty:
- **Ordovita.Domain** — encje/agregaty, value objecty, `Result`/`Error`, wyjątki domenowe. Bez zależności zewnętrznych.
- **Ordovita.Application** — handlery CQRS (`ICommand`/`IQuery` + `…Handler`), DTO, walidatory (FluentValidation), porty (interfejsy).
- **Ordovita.Infrastructure** — EF Core (MySQL), repozytoria, migracje, integracje (Groq LLM, SMTP, Google OAuth), implementacja mediatora.
- **Ordovita.Api** — Minimal API endpoints, kompozycja (Program.cs), auth, OpenAPI.

### Przepływ żądania (wzorzec do naśladowania)
1. **Endpoint** (Minimal API), grupowany pod `/api/v1` → [ApiEndpointsExtensions.cs](DotNetServer/Ordovita.Api/Endpoints/ApiEndpointsExtensions.cs). Wzorzec endpointu: [WorkspaceTasksEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Tasks/WorkspaceTasksEndpoint.cs).
2. Endpoint buduje `Command`/`Query` i woła **`ISender.Send(...)`** (custom mediator — **nie MediatR**): [Sender.cs](DotNetServer/Ordovita.Infrastructure/Cqrs/Sender.cs) rozwiązuje handler przez DI/refleksję i przepuszcza przez `IPipelineBehavior` (m.in. [ValidationBehavior](DotNetServer/Ordovita.Application/Common/Behaviors/ValidationBehavior.cs)).
3. Handler zwraca **`Result<T>`**. Endpoint mapuje: sukces → `Results.Ok/Created/NoContent`, błąd → `result.Error.ToProblem()` ([ErrorExtensions.cs](DotNetServer/Ordovita.Api/Common/ErrorExtensions.cs)).
4. Mapowanie encja→DTO w `*Mapper`/`*Dtos.cs` (np. [TaskDtos.cs](DotNetServer/Ordovita.Application/Tasks/TaskDtos.cs)).

Foldery feature'owe grupują się jako `Application/<Obszar>/<UseCase>/{Command,Handler,Validator}.cs`. Każdy use-case = osobny folder.

### Moduły domenowe
Identity/Auth, DomainUser, Workspace (+ wielu userów: `WorkspaceUser`), Tasks (WorkTask, TaskCategory, WorkTaskStatus, CalendarEvent, WorkCalendar), Note (+ NoteFolder, NoteTaskLink, NoteEventLink), Surveys, LlmSettings, LlmStatistic, **Plan** (subskrypcje/limity).

### Plan / limity (najnowszy moduł)
- [PlanLimitChecker.cs](DotNetServer/Ordovita.Application/Plan/PlanLimitChecker.cs) limituje **tylko**: planowanie AI-tasków (`PlanAiTask`), liczbę publicznych i prywatnych workspace'ów. **Nie** dotyka notatek, wydarzeń ani zadań.
- Defaulty: [PlanDefaults.cs](DotNetServer/Ordovita.Domain/Plan/PlanDefaults.cs) (Free: 15 AI tasków, 3 public + 3 private workspace). Seed planu przy starcie ([PlanSeeder](DotNetServer/Ordovita.Infrastructure/Plan/PlanSeeder.cs)).

### Seedy przy starcie ([Program.cs](DotNetServer/Ordovita.Api/Program.cs))
Migracje → role → sync DomainUser↔AspIdentity → seed ankiet → seed planów. Domyślne statusy zadań tworzy [WorkspaceTaskInitializer.cs](DotNetServer/Ordovita.Infrastructure/Tasks/WorkspaceTaskInitializer.cs): **To Do, In Progress, Cancelled, Completed** (w tej kolejności).

---

## 🔐 Auth i konfiguracja

- **Auth:** ASP.NET Identity + Bearer token (access 1h, refresh 30 dni) + Google OAuth. Endpointy tożsamości pod `/api/v1/identity/*`.
- **Tokeny po stronie klienta:** web → `localStorage`, native → `expo-secure-store`. Odświeżanie automatyczne w interceptorze ([client.ts](client/lib/api/client.ts)).
- **Konfiguracja backendu** (env, sekcje `__`): `ConnectionStrings__Database`, `GroqSection__*` (LLM), `EmailSection__*` (SMTP), `Authentication__Google__*`, `OAuth2__FrontendUrl` / `__DesktopBrowserCallbackUrl`, `Crypto__SecretKey`. Wzór: [DotNetServer/.env.example](DotNetServer/.env.example).
- **Konfiguracja frontu:** `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_PREFIX` (default `/api/v1`).

---

## ⚠️ Konwencje i pułapki

Wiedza nieoczywista — czytaj zanim zaczniesz zmieniać te obszary:

1. **`server/` to martwy kod (Java).** Backend = wyłącznie `DotNetServer`.
2. **tsc baseline ~22 błędów** (RN-Web `dataSet`/`cursor`/`outlineStyle`). Nie panikuj; porównuj do baseline (stash/pop), nie do zera.
3. **Treść notatki NIE jest sanityzowana** na backendzie — kolumna `json`, bez limitu długości ([NoteConfiguration.cs](DotNetServer/Ordovita.Infrastructure/Note/Persistence/NoteConfiguration.cs)). Inline style (np. `width` obrazka) zapisują się trwale.
4. **`CalendarEvent` NIE ma przypisanych userów** — tylko `WorkTask.AssignedUsers`. Filtr „po userze" działa wyłącznie na zadaniach; na kalendarzu jedynie pośrednio przez powiązany task.
5. **Kalendarz na mobile web (<768px):** interakcje drag są celowo wyłączone (inaczej `touchAction:none` blokuje scroll). Patrz guard w efekcie drag w [calendar.tsx](client/app/%28app%29/calendar.tsx). Na desktop web drag działa; kafelki na mobile są `TouchableOpacity` (tap → edycja).
6. **Filtry w Zadaniach to portale web-only** (`createPortal` do `document.body`); na native renderują się tylko przyciski. Wzorce: priorytet/kategoria/status/assignee w [tasks.tsx](client/app/%28app%29/tasks.tsx).
7. **Kolejność kolumn kanban** zapisuje się w localStorage pod kluczem `kanban-column-order-v2` (bump wersji resetuje stare ustawienia). Kanon: [taskStatusOrder.ts](client/lib/utils/taskStatusOrder.ts) → To Do → In Progress → Cancelled → Completed; jest zawsze bazą, a zapisany porządek tylko ją modyfikuje.
8. **Druk kalendarza = web only** ([calendarPrint.ts](client/lib/utils/calendarPrint.ts)) — generuje HTML i drukuje przez ukryty iframe (`srcdoc` + `onload`). 3 motywy: `classic`/`mono`/`grid`. Dzień/tydzień = siatka godzinowa, miesiąc = 6×7. Orientacja: dzień pionowo, tydzień/miesiąc poziomo.
9. **Branch:** pracuj na feature branchach (repo bywa na `frontend/...`), nie commituj do `main` bez prośby. Commity tworzyć tylko gdy użytkownik o to poprosi.

---

## 🗺 Mapa funkcji (gdzie co jest)

| Obszar | Frontend | Backend |
|---|---|---|
| Zadania (kanban/lista, filtry, assignee) | [tasks.tsx](client/app/%28app%29/tasks.tsx), [TaskModals.tsx](client/components/organisms/TaskModals.tsx) | [WorkspaceTasksEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Tasks/WorkspaceTasksEndpoint.cs), `Application/Tasks/*` |
| Kalendarz (dzień/tydzień/miesiąc, drag, druk, „dziś", linia teraz) | [calendar.tsx](client/app/%28app%29/calendar.tsx), [calendarPrint.ts](client/lib/utils/calendarPrint.ts), [eventColors.ts](client/lib/utils/eventColors.ts) | endpointy `event` w WorkspaceTasksEndpoint, `Application/Tasks/Events/*` |
| Notatki (rich text, obrazki, linki do task/event) | [notes/](client/components/organisms/notes/) | [NoteEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Note/NoteEndpoint.cs), `Application/Note/*` |
| AI planowanie | [ai-task.tsx](client/app/%28app%29/ai-task.tsx) | `Application/Tasks/Ai/*`, `Infrastructure/Llm/*` (Groq) |
| Workspaces + członkowie | [workspaces.tsx](client/app/%28app%29/workspaces.tsx), [workspace-settings.tsx](client/app/%28app%29/workspace-settings.tsx) | [WorkspaceEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Workspaces/WorkspaceEndpoint.cs) |
| Plany/subskrypcje + admin | [admin-plans.tsx](client/app/%28app%29/admin-plans.tsx), [admin-users.tsx](client/app/%28app%29/admin-users.tsx), [PlanUsageBar.tsx](client/components/molecules/PlanUsageBar.tsx) | [PlanEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Plan/PlanEndpoint.cs), [AdminEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Admin/AdminEndpoint.cs) |
| Ankiety | [surveys.tsx](client/app/%28app%29/surveys.tsx), `admin-survey-*` | `Surveys/` endpoints, `Application/Surveys/*` |

---

## 🚀 Deployment / CI

- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) (trigger: push do `main`): buduje Docker images (backend + frontend), buduje desktop installery (Windows NSIS, macOS DMG arm64) jako artefakty.
- Produkcja: [docker-compose-prod.yml](docker-compose-prod.yml) — obrazy z Docker Hub, za Traefik (domena `ordovita.pl`), env z sekretów.
- Healthcheck backendu: `GET /health` → `ok`.

---

## 📓 Changelog

> Dopisuj na górze: `YYYY-MM-DD — co i gdzie`. Krótko.

- **2026-06-29** — Utworzono `CLAUDE.md`. Zaimplementowano (frontend-only): zaznaczenie „dziś" w kalendarzu (tinta kolumny, kółko w nagłówku, linia „teraz"), fix scrolla/tap na mobile web, resize wklejonych obrazków w notatkach, filtr zadań po przypisanym userze (+„Nieprzypisane"), druk kalendarza (3 motywy, siatka godzinowa). Fixy: ukrywanie pustego paska all-day, pierwsza etykieta godziny nie nachodzi na all-day, kanon kolejności kolumn kanban (klucz `…-v2`), cień na wybranym dniu (mobile 3-day).

---

_Last updated: 2026-06-29_
