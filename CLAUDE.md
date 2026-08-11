# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Cel tego pliku:** to jest „mózg projektu" dla AI. Czytasz go raz na starcie sesji i wiesz, *co gdzie jest*, *jak się to pisze* i *na czym można się wyłożyć* — bez przeszukiwania całego repo. Jest wczytywany automatycznie przez Claude Code, więc trzymaj go aktualnym.

---

## 🔄 Protokół utrzymania (PRZECZYTAJ NAJPIERW)

Ten plik ma działać jak dobry Obsidian: zawsze aktualny, z linkami do źródeł.

**Po KAŻDYM ukończonym zadaniu zaktualizuj `CLAUDE.md`:**
1. Jeśli zmieniłeś architekturę, przepływ danych, konwencję lub dodałeś moduł/feature → zaktualizuj właściwą sekcję (w tym [Mapa API](#-mapa-api-backend) / [Klucze React Query](#klucze-react-query-cache)).
2. Dopisz wpis w [Changelog](#-changelog) (data + 1–2 zdania, co i gdzie).
3. Jeśli odkryłeś nieoczywistą pułapkę → dopisz ją do [Konwencje i pułapki](#-konwencje-i-pułapki).
4. Zaktualizuj `Last updated` na dole.
5. Nie duplikuj tego, co łatwo wywnioskować z kodu; zapisuj **wiedzę nieoczywistą** (decyzje, gotchas, „dlaczego tak").

Linki do plików podawaj względem roota repo, np. [client/app/(app)/calendar.tsx](client/app/%28app%29/calendar.tsx).

---

## 📍 Orientacja w 30 sekund

**Ordovita** — AI task & calendar manager. Monorepo: jeden frontend (Expo / React Native działający na **web + desktop Electron + native**) i jeden backend **.NET 10**.

- **Backend właściwy: [DotNetServer/](DotNetServer/)** (.NET 10, Clean Architecture + CQRS). To jest źródło prawdy.
- ⚠️ **[server/](server/) to MARTWY stary backend (Java/Gradle) — IGNORUJ go.** Nie edytuj, nie wnioskuj z niego.
- **Frontend: [client/](client/)** — Expo Router, NativeWind (Tailwind), React Query, Zustand.
- **Design system: [design-system/](design-system/)** (skill + tokeny + karty HTML) oraz spec [client/DESIGN_SYSTEM.md](client/DESIGN_SYSTEM.md) — język wizualny „Arena".
- Język UI: PL + EN (i18n wdrożone w całym `(app)/` — patrz [i18n](#i18n--wdrożone-w-całym-app)). Kod/komentarze: mieszane PL/EN.

Spis treści:
- [Komendy](#-komendy)
- [Architektura frontendu](#-architektura-frontendu-client)
- [Architektura backendu](#-architektura-backendu-dotnetserver)
- [Mapa API (backend)](#-mapa-api-backend)
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
- ⚠️ **Nie ma skryptu `typecheck`/`lint`/`test` w package.json.** `npx tsc --noEmit` to jedyna automatyczna bramka jakości.
- ✅ **Baseline = 0 błędów** (zweryfikowane 2026-07-28; `strict: true`). Każdy błąd TS to regresja — napraw, nie ignoruj. (Dawne ~22 błędy RN-Web `dataSet`/`cursor`/`outlineStyle` zostały wyeliminowane; kod używa teraz stałych typu `NO_OUTLINE` z `as any`.)
- Alias ścieżek: `@/*` → `client/*`.

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
- DB: MySQL (Pomelo), connection string w `.env` / `ConnectionStrings__Database`. **Docker compose NIE stawia MySQL** — baza jest zewnętrzna (`host.docker.internal` lub hosting).
- Wersje pakietów centralnie w [Directory.Packages.props](DotNetServer/Directory.Packages.props); `net10.0`, `Nullable=enable`, `ImplicitUsings=enable` w [Directory.Build.props](DotNetServer/Directory.Build.props).
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

### Routing i ekrany
- [client/app/](client/app/) — trasy. Grupy: `(auth)` (login/register/forgot-password/setup-password/verify-email), `(app)` (zalogowany obszar).
- Ekrany w [client/app/(app)/](client/app/%28app%29/): `dashboard`, `tasks`, `calendar`, `notes`, `ai-task`, `statistics`, `search`, `notifications`, `categories`, `statuses`, `profile`, `workspaces`, `workspace-create`, `workspace-settings`, `surveys`, `survey-onboarding`, `my-responses`, `admin-users`, `admin-plans`, `admin-surveys`, `admin-survey-builder`, `admin-survey-responses`.
- Trasy publiczne (poza grupami): `index`, `privacy-policy`, `terms-of-service`, `oauth-callback`, `desktop-oauth-complete`.
- **Nawigacja:** [(app)/_layout.tsx](client/app/%28app%29/_layout.tsx) to `<Tabs>`; na web (`Platform.OS === "web"`) tab bar jest ukryty (`display:none`) i nawiguje [SideNavBar.tsx](client/components/organisms/SideNavBar.tsx). **Nowy ekran w `(app)/` musi dostać `<Tabs.Screen name="..." options={{ href: null }} />`**, inaczej pojawi się jako zakładka na mobile.
- **Bramka startowa:** [app/_layout.tsx](client/app/_layout.tsx) → `AuthGate` decyduje o przekierowaniach: niezalogowany → `/login`; zalogowany z zaległą ankietą → `/survey-onboarding`; bez workspace'ów → `/workspace-create`; bez aktywnego workspace → `/workspaces`; ADMIN → `/admin-surveys`, USER → `/dashboard`. Tu też: `QueryClient` (`staleTime 5 min`, `retry 2`), fonty Inter, przełączanie klasy `.dark` na `<html>`, `startSessionKeepAlive()`.

### Warstwa danych (wzorzec do naśladowania)
1. **HTTP**: [client/lib/api/client.ts](client/lib/api/client.ts) — axios + interceptory. Base URL = `EXPO_PUBLIC_API_URL` → `window.location.origin` (web) → `http://localhost:8080`; prefix `EXPO_PUBLIC_API_PREFIX` (default `/api/v1`); timeout 60 s. Auto-refresh tokenu na 401 (kolejkuje równoległe żądania, `_retry` chroni przed pętlą). Tokeny: web → `localStorage`, native → `expo-secure-store`.
2. **Moduły API**: [client/lib/api/](client/lib/api/) — `tasks` (task/category/status/event/ai), `workspace`, `notes`, `identity`, `user`, `surveys`, `plan`, `admin`, `llmSettings`. Reeksport w [index.ts](client/lib/api/index.ts).
3. **Adaptery DTO↔model**: [adapters.ts](client/lib/api/adapters.ts) — `mapTaskDto`, `mapEventDto`, `mapNoteDto`, … + `normalizeArray`. **Cała normalizacja dat, priorytetów i treści notatek dzieje się tutaj.**
4. **Hooki** (React Query): [client/lib/hooks/index.ts](client/lib/hooks/index.ts) — ~75 hooków. To **jedyny** punkt wejścia do danych w komponentach; nie wołaj `*Api` bezpośrednio z ekranu.
5. **Typy**: [client/lib/types/index.ts](client/lib/types/index.ts) — `Task`, `TaskStep`, `CalendarEvent`, `Workspace`, `WorkspaceUser`, `Note`, `Plan`, `UserPlanUsage`, request/response DTO.

#### Klucze React Query (cache)
Zakresowane po workspace: `["tasks", wsId]`, `["events", wsId]`, `["categories", wsId]`, `["taskStatuses", wsId]`, `["notes", wsId]`, `["noteFolders", wsId]`, `["aiProposals", wsId]`.
Zakresowane po workspace + zadaniu: `["taskComments", wsId, taskId]`, `["taskHistory", wsId, taskId]`.
Globalne: `["userPlan"]`, `["adminPlans"]`, `["adminUsers"]`, `["llmSettings"]`, `["llmProviders"]`, `["llmModels"]`, `["aiStatistics"]`, `["surveys"]`, `["active-surveys"]`, `["survey-questions", surveyId]`, `["question-options", questionId]`, `["user-responses"]`, `["survey-responses", surveyId]`, `["my-responses"]`.

Zasady utrzymane w hookach (trzymaj je przy dopisywaniu nowych):
- Zapytania zakresowane workspace mają `enabled: !!workspaceId` i `requireWorkspaceId()` w `queryFn`.
- Mutacje edycyjne robią **optimistic update**: `onMutate` → snapshot → `onError` rollback → `onSettled` invalidate.
- Zmiana taska unieważnia też `events` i odwrotnie (task ↔ powiązane wydarzenie są sprzężone).
- `useGenerateAiPlan` unieważnia `["userPlan"]` (każda generacja zjada limit).
- `useEditTask` unieważnia też `["taskHistory", wsId]` (każda edycja dopisuje wersję).
- Zmiana aktywnego workspace / widoczności / usunięcie workspace robi `qc.invalidateQueries()` bez klucza (globalny reset).

### Stan globalny — Zustand ([client/lib/stores/](client/lib/stores/))
| Store | Odpowiada za | Trwałość |
|---|---|---|
| `useAuthStore` | user, tokeny, login/logout, `hydrate()` | localStorage / SecureStore |
| `useWorkspaceStore` | lista workspace'ów, `activeWorkspaceId`, `defaultWorkspaceId`, członkowie | `activeWorkspaceId` |
| `useThemeStore` | `light`/`dark` | `themeMode` (localStorage) |
| `useLanguageStore` ([i18n/store.ts](client/lib/i18n/store.ts)) | język PL/EN | `appLanguage` (localStorage) |
| `useLlmSettingsSelectionStore` | wybrana konfiguracja LLM | — |
| `useAiPlanningRequestStore` | kolejka „zaplanuj ten tekst AI" (notatki → ai-task) | — |

⚠️ Workspace'y **nie są** w React Query — `useWorkspaces()` czyta ze store'a. Kolejność wyboru aktywnego workspace przy starcie: serwerowy `defaultWorkspaceId` → zapamiętany lokalnie → pierwszy z listy ([workspace.ts](client/lib/stores/workspace.ts)).

### i18n — wdrożone w całym `(app)/`
- Języki: **pl + en** ([config.ts](client/lib/i18n/config.ts)), domyślny `pl`. Słowniki **płaskie** (klucze `namespace.key`) w [translations.ts](client/lib/i18n/translations.ts). Interpolacja `{name}`. Fallback: aktywny język → `pl` → sam klucz.
- Użycie: `const t = useT(); t("tasks.filterStatus")`. Dodając tekst → dodaj klucz do **obu** języków.
- **Daty/godziny: `useLocale()`** (w komponentach) lub `getLocale()` (poza Reactem) z [lib/i18n](client/lib/i18n/index.ts) — **nigdy zaszyte `"pl-PL"`/`"en-US"`**, bo zamrażają format niezależnie od przełącznika języka. Poza Reactem tłumacz przez `tr(key)`.
- Stan na 2026-07-29: wszystkie ekrany `(app)/`, `(auth)/`, landing i walidacja zod przeszły na i18n (646 kluczy × 2 języki, parytet PL/EN zweryfikowany). **Poza i18n świadomie zostają:** [app/+html.tsx](client/app/%2Bhtml.tsx) (statyczna skorupa HTML renderowana poza Reactem — nie ma dostępu do store'u języka), [privacy-policy.tsx](client/app/privacy-policy.tsx) i [terms-of-service.tsx](client/app/terms-of-service.tsx) (teksty prawne — tłumaczenie ma skutki prawne, decyzja właściciela).

### Design system („Arena")
- Źródła prawdy: [client/DESIGN_SYSTEM.md](client/DESIGN_SYSTEM.md) (spec), [client/global.css](client/global.css) (CSS vars: `:root` + `.dark`), [client/tailwind.config.js](client/tailwind.config.js) (skala tokenów), [lib/utils/uiTokens.ts](client/lib/utils/uiTokens.ts) (`getUiTokens(isDark)` do inline'owych propów RN), [design-system/](design-system/) (skill + karty).
- **Zasada kardynalna: nigdy nie wpisuj surowego hexa — użyj tokenu.** Jedna wartość na rolę: accent `#5b4ee0` / dark `#9b8cff`, error `#ba1a1a`, critical `#c0392b`, warning `#b7770d`, success `#2e7d52`, events `#dc2c4f`, notes `#006b58`. Nigdy generycznych szarości Tailwinda (`#9ca3af`, `#6b7280`).
- Tokeny klas: `bg-background`, `bg-surface`, `bg-surface-container-*`, `text-on-surface`, `text-on-surface-variant`, `border-outline-variant`, `text-primary`, `font-headline/body/label`.
- Typografia: Playfair Display (400) tylko dla największego elementu ekranu; Inter ≤500 dla całego UI. Ikony: **wyłącznie Material Icons** (`@expo/vector-icons`), AI zawsze `auto_awesome` w kolorze accent. Karty płaskie: 1px `outline-variant`, bez cienia (cienie tylko kanban + modale).
- Komponenty: atomic design w [client/components/](client/components/) → `atoms/`, `molecules/`, `organisms/`. Układ strony: [PageLayout.tsx](client/components/organisms/PageLayout.tsx) (desktop = web i `width >= 1024` → SideNavBar + AppHeader + opcjonalny `rightRail`).

### Edytor notatek — kluczowy wzorzec
- [client/components/organisms/notes/editorHtml.ts](client/components/organisms/notes/editorHtml.ts) (~1000 linii) to **jeden samodzielny dokument HTML** (contenteditable + JS) hostowany w `<iframe>` (web) i `react-native-webview` (native). Most host↔editor przez `postMessage` (JSON: `setContent`/`command`/`change`/`state`/…).
- Hosty: [RichTextEditor.web.tsx](client/components/organisms/notes/RichTextEditor.web.tsx) (iframe) i [RichTextEditor.native.tsx](client/components/organisms/notes/RichTextEditor.native.tsx) (WebView). [RichTextEditor.tsx](client/components/organisms/notes/RichTextEditor.tsx) to tylko re-eksport wariantu native — **Metro sam wybiera `.web.tsx` na web**. Kontrakt: [RichTextEditor.types.ts](client/components/organisms/notes/RichTextEditor.types.ts) (`RichTextEditorHandle`: `sendCommand`/`setContent`/`focus`).
- Ekran: [NotesScreen.tsx](client/components/organisms/notes/NotesScreen.tsx) (~1580 linii) + toolbar [NoteEditorToolbar.tsx](client/components/organisms/notes/NoteEditorToolbar.tsx).
- **Nowe funkcje edytora (formatowanie, slash-menu, checklisty, resize obrazków) dodaje się w JS wewnątrz `editorHtml.ts`** — działają wtedy na wszystkich platformach naraz.
- Treść notatki jedzie do API jako `contentJson` = koperta `{version, format:"html", html, text}` (`buildNoteContentJson` / `parseNoteContent` w [adapters.ts](client/lib/api/adapters.ts)); `text` służy podglądom i wyszukiwaniu.

---

## 🧱 Architektura backendu ([DotNetServer/](DotNetServer/))

.NET 10, **Clean Architecture + CQRS**. 4 projekty:
- **Ordovita.Domain** — encje/agregaty, strongly-typed ID, `Result`/`Error`, wyjątki domenowe. Zero zależności zewnętrznych.
- **Ordovita.Application** — handlery CQRS (`ICommand`/`IQuery` + `…Handler`), DTO + mappery, walidatory (FluentValidation), porty (interfejsy).
- **Ordovita.Infrastructure** — EF Core (MySQL/Pomelo), repozytoria, konfiguracje EF, migracje, integracje (LLM przez LlmTornado, SMTP/MailKit, Google OAuth), implementacja mediatora.
- **Ordovita.Api** — Minimal API endpoints, kompozycja ([Program.cs](DotNetServer/Ordovita.Api/Program.cs)), auth, OpenAPI/Scalar.

### Przepływ żądania (wzorzec do naśladowania)
1. **Endpoint** (Minimal API) grupowany pod `/api/v1` → [ApiEndpointsExtensions.cs](DotNetServer/Ordovita.Api/Endpoints/ApiEndpointsExtensions.cs). Wzorzec: [WorkspaceTasksEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Tasks/WorkspaceTasksEndpoint.cs) — `MapGroup(...).WithTags(...).RequireAuthorization()`, handlery jako prywatne metody statyczne, request-recordy jako **prywatne, zagnieżdżone `sealed record`** w klasie endpointu.
2. Endpoint buduje `Command`/`Query` i woła **`ISender.Send(...)`** (custom mediator — **nie MediatR**): [Sender.cs](DotNetServer/Ordovita.Infrastructure/Cqrs/Sender.cs) rozwiązuje handler przez DI/refleksję (`dynamic`) i przepuszcza przez `IPipelineBehavior<TResult>` (obecnie tylko [ValidationBehavior](DotNetServer/Ordovita.Application/Common/Behaviors/ValidationBehavior.cs)).
3. Handler zwraca **`Result<T>`** (nigdy nie rzuca wyjątku dla błędu biznesowego). Endpoint mapuje: sukces → `Results.Ok/Created/NoContent`, błąd → `result.Error.ToProblem()` ([ErrorExtensions.cs](DotNetServer/Ordovita.Api/Common/ErrorExtensions.cs)).
4. Mapowanie encja→DTO w `*Mapper`/`*Dtos.cs` (np. [TaskDtos.cs](DotNetServer/Ordovita.Application/Tasks/TaskDtos.cs), [NoteMapper.cs](DotNetServer/Ordovita.Application/Note/NoteMapper.cs)).

### 🍳 Recepta: nowy use-case backendowy (rób dokładnie tak)
1. `Application/<Obszar>/<UseCase>/` — jeden folder na use-case. Command/Query + Handler (+ Validator) albo w jednym pliku `<UseCase>Handler.cs`, albo rozbite na `Command.cs`/`Handler.cs`/`Validator.cs` — oba style są w repo, dopasuj się do sąsiadów w obszarze.
2. `public sealed record XCommand(...) : ICommand<TResult>;` / `: IQuery<TResult>;`. Dla braku wyniku użyj `Unit`.
3. Handler: `public sealed class XHandler(...deps) : ICommandHandler<XCommand, TResult>` z `Task<Result<TResult>> Handle(XCommand cmd, CancellationToken ct)`.
4. W obszarach Tasks/Notes zacznij od `accessGuard.RequireAccessAsync(workspaceId, ct)` ([WorkspaceAccessGuard.cs](DotNetServer/Ordovita.Application/Tasks/WorkspaceAccessGuard.cs)) — sprawdza usera, workspace i dostęp, **oraz leniwie inicjalizuje kalendarz + domyślne statusy**.
5. Zapis przez `IUnitOfWork.SaveChangesAsync(ct)` (to `AppDbContext`) — repozytoria same nie zapisują.
6. ⚠️ **ZAREJESTRUJ HANDLER RĘCZNIE** w [Application/DependencyInjection.cs](DotNetServer/Ordovita.Application/DependencyInjection.cs): `services.AddScoped<ICommandHandler<XCommand, TResult>, XHandler>();`. **Nie ma skanowania assembly dla handlerów** — brak wpisu = runtime `InvalidOperationException` przy pierwszym żądaniu. (Walidatory FluentValidation *są* skanowane automatycznie — validatora nie rejestruj.)
7. Zamapuj endpoint i dopisz go do [Mapy API](#-mapa-api-backend) w tym pliku.

### Domena — konwencje
- Agregaty: `AggregateRoot<TId>` / `Entity<TId>` ([Entity.cs](DotNetServer/Ordovita.Domain/Common/Entity.cs)); prywatny konstruktor bezparametrowy dla EF; statyczna fabryka `Create(...)` zwracająca `Result<T>` z walidacją niezmienników; settery `private set`; kolekcje jako prywatne pole + `IReadOnlyCollection` (np. `WorkTask._steps`, `Workspace._assignedUsers`).
- Strongly-typed ID: `readonly record struct TaskId(Guid Value) : IEntityId<TaskId>` z `New()` (**`Guid.CreateVersion7()`**) i `From(Guid)` rzucającym na `Guid.Empty`.
- Błędy domenowe: statyczne pola w `*Exceptions`/`*Exception` zwracające `Error` (np. `TaskExceptions.MissingTitle`).
- Czas: **wszystko `DateTime.UtcNow`** w domenie.

### Moduły domenowe
Identity/Auth (AspIdentity + DomainUser), Workspace (+ `WorkspaceUser`, `WorkspaceVisibility`), Tasks (`WorkTask`, `TaskStep`, `TaskCategory`, `WorkTaskStatus`, `CalendarEvent`, `WorkCalendar`, `WorkTaskAssignee`), Note (+ `NoteFolder`, `NoteTaskLink`, `NoteEventLink`), Surveys (Survey/Question/UserResponse), LlmSettings, LlmStatistic, Plan.

### Domenowe reguły, o których łatwo zapomnieć
- `WorkTask.Accepted == false` **tylko** dla `TaskSource.AI_PARSED`; `CalendarEvent.Status == PROPOSED` **tylko** dla `ProposedBy.AI`.
- `GET …/task` zwraca **wyłącznie zaakceptowane** taski, `GET …/event` **pomija `PROPOSED`** — propozycje AI wychodzą osobnym endpointem `…/proposals`.
- Utworzenie taska z `DueDateTime` **automatycznie tworzy powiązany `CalendarEvent`** (`start = due`, `end = due + estimatedDuration`). Dlatego front sprzęga cache `tasks` ↔ `events`.
- Limity: `WorkTask.MaxSteps = 20`, `StepTitleMaxLength = 200`; kroki od AI dodatkowo obcięte do 8, odfiltrowane z duplikatów i z powtórzenia tytułu rodzica.
- `Workspace`: dodawać/usuwać userów może **tylko twórca** i tylko w workspace `Public`.

### AI / LLM (moduł najbardziej „żywy")
- Wejście: `POST /workspace/{id}/ai/plan` → [GenerateAiPlanCommand.cs](DotNetServer/Ordovita.Application/Tasks/Ai/GenerateAiPlan/GenerateAiPlanCommand.cs) (access guard → `PlanLimitChecker` → `ILlmPlanningService`). `UserText` max 4000 znaków; `TimeZoneId` z frontu (`Intl.DateTimeFormat().resolvedOptions().timeZone`), nierozpoznana strefa → UTC.
- Orkiestracja: [LlmPlanningService.cs](DotNetServer/Ordovita.Infrastructure/Llm/LlmPlanningService.cs) — buduje kontekst (odpowiedzi ankiet, kategorie ≤20, statusy, do 30 aktywnych tasków), woła model, parsuje ([AiPlanResponseParser.cs](DotNetServer/Ordovita.Infrastructure/Llm/AiPlanResponseParser.cs)); przy niepoprawnym JSON robi **jedną próbę naprawczą** (`LlmPlanPromptBuilder.BuildRecovery`), potem `InvalidAiResponse`. Pojedyncze nieprawidłowe taski/eventy są **pomijane z logiem ostrzegawczym**, nie wywalają całego planu.
- **Prompt: [LlmPlanPromptBuilder.cs](DotNetServer/Ordovita.Application/Abstraction/Llm/LlmPlanPromptBuilder.cs)** — system prompt po polsku (rozbudowane reguły „task vs krok vs wydarzenie") + JSON Schema wymuszany jako structured output. To jest miejsce do strojenia jakości AI; ostatnie commity to iteracje tego pliku.
- Klient: `IAiClient` → **[LlmTornadoProvider.cs](DotNetServer/Ordovita.Infrastructure/Llm/LlmTornado/LlmTornadoProvider.cs)** (biblioteka LlmTornado). Domyślnie Groq + `ChatModel.Groq.OpenAi.GptOss120B` ze structured output; użytkownik może podpiąć własnego providera/klucz (`LlmSettings`, klucz szyfrowany `ICryptoService`) albo własny `CustomUrl` (wtedy **structured output wyłączony**). Każde wywołanie zapisuje `LlmStatistic` (tokeny) — na tym liczy się limit AI.
- ⚠️ [AiGroqClient.cs](DotNetServer/Ordovita.Infrastructure/Llm/Groq/AiGroqClient.cs) **nie jest nigdzie zarejestrowany — to martwy kod**. Z sekcji `GroqSection` realnie używany jest tylko `ApiKey`; `GroqSection__Model` nie wpływa na wybór modelu.

### Plan / limity
- [PlanLimitChecker.cs](DotNetServer/Ordovita.Application/Plan/PlanLimitChecker.cs) limituje **tylko** 3 akcje: `PlanAiTask`, `CreatePublicWorkspace`, `CreatePrivateWorkspace`. **Nie** dotyka notatek, wydarzeń ani zadań.
- Defaulty: [PlanDefaults.cs](DotNetServer/Ordovita.Domain/Plan/PlanDefaults.cs) (Free: 15 AI tasków, 3 public + 3 private workspace; stały `PlanId = 1111…`). Seed przy starcie ([PlanSeeder](DotNetServer/Ordovita.Infrastructure/Plan/PlanSeeder.cs)).
- Zużycie AI = `COUNT(LlmStatistic)` dla usera, czyli **każde wywołanie LLM (łącznie z próbą naprawczą) zjada limit**.

### Seedy przy starcie ([Program.cs](DotNetServer/Ordovita.Api/Program.cs))
Migracje → role → sync DomainUser↔AspIdentity → tabela opcji ankiet + publikacja legacy ankiet → seed planów.
Domyślne statusy zadań tworzy **leniwie** [WorkspaceTaskInitializer.cs](DotNetServer/Ordovita.Infrastructure/Tasks/WorkspaceTaskInitializer.cs) przy pierwszym dostępie do workspace: **To Do, In Progress, Cancelled, Completed** (w tej kolejności) + kalendarz główny.

---

## 🌐 Mapa API (backend)

Wszystko pod `/api/v1`. Wszystko `RequireAuthorization()` poza `/identity/*`, `/oauth2/*` i `/health`.

| Grupa | Endpointy |
|---|---|
| `/identity` | `POST register`, `POST login`, `POST refresh`, `GET confirmEmail`, `POST resendConfirmationEmail`, `POST forgotPassword`, `POST resetPassword`, `POST restartPassword` (zmiana hasła), `POST oauth2/desktop/exchange` |
| *(poza `/api/v1`)* | `GET /oauth2/authorization/google`, `GET /health` |
| `/user` | `GET me`, `POST fullname`, `PUT defaultWorkspace/{workspaceId}`, `GET delete` ⚠️ (usuwa konto GET-em) |
| `/workspace` | `POST create`, `GET all`, `GET {workspaceId}`, `POST {workspaceId}/assignUsers`, `POST {workspaceId}/assignUsersByEmail`, `PATCH {workspaceId}/removeUsers`, `PUT {workspaceId}/visibility`, `DELETE delete/{workspaceId}` |
| `/workspace/{workspaceId}` — taski | `GET/POST/PUT task`, `DELETE task/{taskId}`, `PUT task/{taskId}/assignees`, `POST task/{taskId}/steps`, `PUT/DELETE task/{taskId}/steps/{stepId}`, `PUT task/{taskId}/steps/{stepId}/completion`, `PUT task/{taskId}/steps/order`, `GET/POST task/{taskId}/comments`, `PUT/DELETE task/{taskId}/comments/{commentId}`, `GET task/{taskId}/history` |
| `/workspace/{workspaceId}` — wydarzenia | `GET/POST/PUT event`, `DELETE event/{eventId}` |
| `/workspace/{workspaceId}` — słowniki | `GET/POST/PUT category`, `DELETE category/{categoryId}`, `GET/POST/PUT task-status`, `DELETE task-status/{statusId}` |
| `/workspace/{workspaceId}/ai` | `POST plan` |
| `/workspace/{workspaceId}/proposals` | `GET /`, `POST tasks/{taskId}/accept`, `DELETE tasks/{taskId}`, `POST events/{eventId}/accept`, `DELETE events/{eventId}` |
| `/workspace/{workspaceId}/note` | `POST folder/create`, `GET folder/all`, `PUT/DELETE folder/{folderId}`, `POST create`, `GET all`, `PUT {noteId}/content`, `PUT {noteId}/metadata`, `PUT {noteId}/links`, `DELETE {noteId}` |
| `/llm-settings` | `POST /`, `GET models`, `GET providers`, `GET {llmSettingId}`, `GET all-llmSettings`, `PUT edit/{llmSettingId}`, `DELETE delete/{llmSettingId}` |
| `/plan` | `GET userPlan` |
| `/admin` (rola ADMIN) | `GET plans`, `POST plans`, `GET users` |
| `/survey` | `GET allAcrive` ⚠️ (literówka utrwalona w kontrakcie = „allActive"), `POST createSurvey`, `PUT edit/{surveyId}`, `PATCH changeVisible/{surveyId}`, `GET all`, `DELETE delete/{surveyId}` |
| `/question` | `POST {surveyId}`, `GET allSurveyQuestion/{surveyId}`, `GET questionOptions/{questionId}`, `PUT edit/{questionId}`, `PATCH deleteQuestion/{questionId}` ⚠️ (usuwanie PATCH-em) |
| `/user-response` | `POST {surveyId}`, `PUT change/{userResponseId}`, `DELETE delete/{userResponseId}`, `GET getAllUserResponse`, `GET survey/{surveyId}` |

Kody odpowiedzi: sukces `200/201/204`; błąd → ProblemDetails z `title = Error.Code`, `detail = Error.Description`, status wg `ErrorType` (NotFound→404, Validation→400, Conflict→409, Unauthorized→401, reszta→500).

---

## 🔐 Auth i konfiguracja

- **Auth:** ASP.NET Identity + Bearer token (access 1 h, refresh 30 dni) + Google OAuth. Endpointy tożsamości pod `/api/v1/identity/*`; wystawianie tokenów: [IdentityTokenIssuer.cs](DotNetServer/Ordovita.Api/Endpoints/Identity/IdentityTokenIssuer.cs).
- **Dwa modele użytkownika:** `AspIdentityUser` (Identity, `AspNetUsers`) i `DomainUser` (domena: `PlanId`, `Role`, `IsEnable`, `DefaultWorkspaceId`). Synchronizowane seedem przy starcie.
- ⚠️ **`IUserContext.UserId` zwraca ID **AspIdentity**, nie `DomainUser.Id`.** W handlerach zawsze rozwiązuj przez `userRepository.GetAsyncByAspId(...)` — najprościej `WorkspaceUserResolver.GetCurrentDomainUserAsync(...)` albo `WorkspaceAccessGuard`.
- **Tokeny po stronie klienta:** web → `localStorage`, native → `expo-secure-store`. Odświeżanie: interceptor 401 ([client.ts](client/lib/api/client.ts)) **oraz** proaktywny keep-alive co 4 min i na `visibilitychange`/`AppState` ([session.ts](client/lib/session.ts)).
- **Desktop OAuth:** Electron otwiera przeglądarkę → callback `desktop-oauth-complete` → kod wymieniany przez `POST /identity/oauth2/desktop/exchange` ([DesktopOAuthCodeService.cs](DotNetServer/Ordovita.Api/Endpoints/Identity/DesktopOAuthCodeService.cs)); most `window.ordovitaDesktop` w [lib/desktop.ts](client/lib/desktop.ts), protokół `aitaskmanager://`.
- **Konfiguracja backendu** (env, sekcje `__`): `ConnectionStrings__Database`, `GroqSection__ApiKey`, `EmailSection__*` (SMTP), `Authentication__Google__*`, `OAuth2__FrontendUrl` / `__DesktopBrowserCallbackUrl`, `Crypto__SecretKey`. Wzór: [DotNetServer/.env.example](DotNetServer/.env.example).
- **Konfiguracja frontu:** `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_API_PREFIX` (default `/api/v1`).

---

## ⚠️ Konwencje i pułapki

Wiedza nieoczywista — czytaj zanim zaczniesz zmieniać te obszary.

### Backend
1. **`server/` to martwy kod (Java).** Backend = wyłącznie `DotNetServer`. Martwy jest też `AiGroqClient` (patrz [AI/LLM](#ai--llm-moduł-najbardziej-żywy)).
2. **Handlery CQRS rejestruje się RĘCZNIE** w [Application/DependencyInjection.cs](DotNetServer/Ordovita.Application/DependencyInjection.cs). Zapomnisz → 500 przy pierwszym żądaniu. Walidatory idą automatem.
3. **`ErrorType.LimitExceeded` nie jest zmapowany w [ErrorExtensions.cs](DotNetServer/Ordovita.Api/Common/ErrorExtensions.cs)** → wpada w `_ =>` i wychodzi jako **HTTP 500**, mimo że semantycznie to 402/429. Front rozpoznaje limit po kodzie (`AiTask.PlanLimitExceeded`) w `title`. Nie „naprawiaj" tego bez sprawdzenia obsługi po stronie frontu.
4. **Priorytet: backend ma `URGENT`, front ma `CRITICAL`.** Tłumaczenie w obie strony robi [adapters.ts](client/lib/api/adapters.ts) (`mapPriority` / `mapPriorityToApi`), a po stronie AI [AiPlanMapper.ParsePriority](DotNetServer/Ordovita.Infrastructure/Llm/AiPlanMapper.cs). Nowe wywołanie API z priorytetem musi przejść przez `mapPriorityToApi`, inaczej `CRITICAL` nie sparsuje się w enumie.
5. **Treść notatki NIE jest sanityzowana** na backendzie — kolumna `json`, bez limitu długości ([NoteConfiguration.cs](DotNetServer/Ordovita.Infrastructure/Note/Persistence/NoteConfiguration.cs)). Inline style (np. `width` obrazka) zapisują się trwale.
6. **`CalendarEvent` NIE ma przypisanych userów** — tylko `WorkTask.AssignedUsers`. Filtr „po userze" działa wyłącznie na zadaniach; na kalendarzu jedynie pośrednio przez powiązany task.
7. **`WorkspaceTaskEnsurer` blokuje inicjalizację statycznym `ConcurrentDictionary<Guid, SemaphoreSlim>`** — działa w obrębie jednej instancji procesu. Przy skalowaniu poziomym trzeba to przemyśleć.
8. **Nietypowe czasowniki HTTP w API ankiet i konta:** `GET /user/delete` (usuwa konto), `PATCH /question/deleteQuestion/{id}` (usuwa pytanie), `PATCH /survey/changeVisible/{id}`, `GET /survey/allAcrive` (literówka). Nie „poprawiaj" bez równoczesnej zmiany [client/lib/api/surveys.ts](client/lib/api/surveys.ts) i [user.ts](client/lib/api/user.ts).

### Frontend
9. **Daty to lokalny „wall-clock", nie ISO-UTC.** `parseApiDateTime` traktuje wartość bez offsetu jako czas lokalny, a `toLocalDateTimeString` wysyła `YYYY-MM-DDTHH:mm:ss` **bez `Z`** ([utils/index.ts](client/lib/utils/index.ts)). Po `mapTaskDto`/`mapEventDto` pola `dueDateTime`, `startDateTime`, `endDateTime` są już lokalne — **nie wołaj na nich `new Date(...).toISOString()`**, bo przesuniesz godzinę. Do zapisu używaj `normalizeDueDateTime` / `resolveTaskDueDateTimeForSave`.
10. **Źródłem prawdy o terminie taska jest powiązane wydarzenie**, gdy istnieje — `getEffectiveTaskDueDateTime()` w [utils/index.ts](client/lib/utils/index.ts). Nie czytaj gołego `task.dueDateTime` w UI terminów.
11. **`tsc` musi być czysty (0 błędów).** Baseline zweryfikowany 2026-07-28 — nie porównuj już „do baseline", tylko do zera.
12. **Kalendarz na mobile web (<768 px):** interakcje drag są celowo wyłączone (inaczej `touchAction:none` blokuje scroll). Patrz guard w efekcie drag w [calendar.tsx](client/app/%28app%29/calendar.tsx). Na desktop web drag działa; kafelki na mobile są `TouchableOpacity` (tap → edycja).
13. **Filtry w Zadaniach i menu kontekstowe to portale web-only** (`createPortal` do `document.body`); na native renderują się tylko przyciski. Wzorce: priorytet/kategoria/status/assignee w [tasks.tsx](client/app/%28app%29/tasks.tsx).
14. **Kolejność kolumn kanban** zapisuje się w localStorage pod kluczem `kanban-column-order-v2` (bump wersji resetuje stare ustawienia). Kanon: [taskStatusOrder.ts](client/lib/utils/taskStatusOrder.ts) → To Do → In Progress → Cancelled → Completed; jest zawsze bazą, a zapisany porządek tylko ją modyfikuje. Statusy rozpoznawane są **po nazwie** (PL+EN), nie po ID.
15. **Druk kalendarza = web only** ([calendarPrint.ts](client/lib/utils/calendarPrint.ts)) — generuje HTML i drukuje przez ukryty iframe (`srcdoc` + `onload`). 3 motywy: `classic`/`mono`/`grid`. Dzień/tydzień = siatka godzinowa, miesiąc = 6×7. Orientacja: dzień pionowo, tydzień/miesiąc poziomo.
16. **Powiadomienia i wyszukiwarka nie mają backendu.** [notifications.tsx](client/app/%28app%29/notifications.tsx) i [search.tsx](client/app/%28app%29/search.tsx) liczą wszystko lokalnie z cache'u React Query (`useTasks`/`useEvents`/`useAiProposals`/`useCategories`). Nie szukaj endpointu.
17. **Statystyki AI są zaślepką** — `aiStatisticApi` w [tasks.ts](client/lib/api/tasks.ts) zwraca pustą listę i rzuca przy delete („not implemented in .NET backend yet").
18. **Nowy ekran w `(app)/` → dopisz `<Tabs.Screen … href: null />`** w [(app)/_layout.tsx](client/app/%28app%29/_layout.tsx), inaczej wskoczy do dolnej nawigacji na mobile.

19. **Nie filtruj „przepuszczalnie", gdy zależna query jeszcze leci.** Wzorzec `!statuses?.length || !isDone(...)` przepuszcza **wszystko**, dopóki `useTaskStatuses()` nie wróci — a że `useTasks()` i `useTaskStatuses()` to dwie niezależne query, ekran renderuje się w momencie przyjścia tasków i miga zakończonymi zadaniami. Poprawnie: `if (!statuses) return []` + osobna flaga ładowania obejmująca **obie** query (wzorzec: `todoLoading` w [dashboard.tsx](client/app/%28app%29/dashboard.tsx), `orderedStatuses` w [tasks.tsx](client/app/%28app%29/tasks.tsx)). Uwaga: `isLoading` na dashboardzie celowo **nie** obejmuje statusów — statystyki i kalendarz ich nie potrzebują.

20. **`PageLayout` NIE scrolluje — każdy ekran musi dać własny `ScrollView`.** Kontener treści w [PageLayout.tsx](client/components/organisms/PageLayout.tsx) to `flex-1 … overflow-hidden`, więc treść wyższa niż viewport jest po prostu **ucinana bez paska przewijania** (nie ma przepełnienia body — layout jest na sztywno wysoki). Objaw jest mylący: strona wygląda na kompletną, po prostu urywa się na dole. Wyjątek: ekrany celowo wypełniające viewport (`flex-1 justify-center`, np. [statistics.tsx](client/app/%28app%29/statistics.tsx)) — tam `ScrollView` jest zbędny.
    **Dolny odstęp dawaj w `contentContainerStyle={{ paddingBottom: … }}` ScrollView-a, nigdy na kontenerze `PageLayout`** — padding na kontenerze przycinającym odsuwa scrollport od dołu ekranu i tworzy martwy pas z twardą linią ucięcia w połowie karty (tak było do 2026-07-28: `paddingBottom` 48 px desktop / 44 px mobile web).

21. **`HistoryDate` to jedyna data z backendu w UTC — reszta to lokalny wall-clock.** `TaskHistory.HistoryDate` zapisuje `DateTime.UtcNow`, ale serializuje się **bez offsetu**, więc wygląda identycznie jak `dueDateTime`. Puszczenie jej przez `parseApiDateTime` (pułapka 9) przesunęłoby czas o strefę. Dlatego `mapTaskHistoryDto` zostawia surowy string, a [TaskHistorySection.tsx](client/components/molecules/TaskHistorySection.tsx) dokłada `Z` (`parseUtcDateTime`). Uwaga: `DueDateTime` **wewnątrz** rekordu historii jest już zwykłym wall-clockiem (`ToString("o")` z domeny) — tam `new Date()` jest poprawne.

22. **Numer wersji historii nadaje domena — handler przekazuje wersję POPRZEDNIĄ.** `TaskHistory.Create(..., short version, ...)` robi wewnątrz `version++`, więc argument to „ostatnia istniejąca wersja", nie „wersja, którą chcę zapisać". `CreateWorkTaskHandler` przekazuje `0` (brak historii), `EditWorkTaskHandler` — wynik `GetNextVersionAsync`, które mimo nazwy zwraca **aktualne maksimum**, nie następny numer. ⚠️ Zadania utworzone przed 2026-08-11 mają wpis `CREATE` pod numerem 2 — każda historia jest wewnętrznie spójna, ale między starymi a nowymi zadaniami numeracja startuje inaczej. Front pokazuje `versionNumber` wprost z DTO i tak ma zostać; nie kompensuj tego odejmowaniem.

23. **Historia obejmuje 7 pól i nic więcej.** `RecordHistoryAsync` w [EditWorkTaskHandler.cs](DotNetServer/Ordovita.Application/Tasks/WorkTasks/EditWorkTask/EditWorkTaskHandler.cs) loguje Title, Description, Priority, EstimatedDuration, DueDateTime, Status, Category. Kroki, komentarze, przypisania i powiązania z notatkami **nie są wersjonowane** — nie obiecuj tego w UI. `TaskHistoryDto` nie zwraca nazwy autora (tylko `UserId`), więc front rozwiązuje ją z `assignedUsers` workspace'u; autor usunięty z workspace'u pokaże się jako „Nieznany użytkownik".

### Proces
24. **Branch:** pracuj na feature branchach (repo bywa na `frontend/...`), nie commituj do `main` bez prośby. Commity tworzyć tylko gdy użytkownik o to poprosi. Push do `main` **odpala deploy produkcyjny**.

---

## 🗺 Mapa funkcji (gdzie co jest)

| Obszar | Frontend | Backend |
|---|---|---|
| Zadania (kanban/lista, filtry, assignee) | [tasks.tsx](client/app/%28app%29/tasks.tsx), [TaskModals.tsx](client/components/organisms/TaskModals.tsx), [TaskCard.tsx](client/components/molecules/TaskCard.tsx) | [WorkspaceTasksEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Tasks/WorkspaceTasksEndpoint.cs), `Application/Tasks/WorkTasks/*` |
| Kroki zadań (subtaski) | [TaskStepsSection.tsx](client/components/molecules/TaskStepsSection.tsx), [CompactTaskSteps.tsx](client/components/molecules/CompactTaskSteps.tsx) | `Application/Tasks/TaskSteps/*`, [TaskStep.cs](DotNetServer/Ordovita.Domain/Tasks/TaskStep.cs) |
| Historia zmian zadania (read-only) | [TaskHistorySection.tsx](client/components/molecules/TaskHistorySection.tsx) — zakładka „Historia" w [TaskModals.tsx](client/components/organisms/TaskModals.tsx) | `Application/Tasks/History/*`, [TaskHistory.cs](DotNetServer/Ordovita.Domain/Tasks/TaskHistory.cs) |
| Kalendarz (dzień/tydzień/miesiąc, drag, druk, „dziś") | [calendar.tsx](client/app/%28app%29/calendar.tsx), [calendarPrint.ts](client/lib/utils/calendarPrint.ts), [eventColors.ts](client/lib/utils/eventColors.ts) | `Application/Tasks/Events/*` (endpointy `event` w WorkspaceTasksEndpoint) |
| Notatki (rich text, obrazki, linki do task/event) | [notes/](client/components/organisms/notes/) | [NoteEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Note/NoteEndpoint.cs), `Application/Note/*` |
| AI planowanie + propozycje | [ai-task.tsx](client/app/%28app%29/ai-task.tsx), [AiProposedCard.tsx](client/components/atoms/AiProposedCard.tsx), [AiChatConfigButton.tsx](client/components/molecules/AiChatConfigButton.tsx) | `Application/Tasks/Ai/*`, `Application/Tasks/Proposals/*`, `Infrastructure/Llm/*` |
| Ustawienia LLM (własny provider/klucz) | [LlmSettingsPanel.tsx](client/components/organisms/LlmSettingsPanel.tsx), [llmSettings.ts](client/lib/utils/llmSettings.ts) | [LlmSettingsEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/LlmSettings/LlmSettingsEndpoint.cs) |
| Workspaces + członkowie | [workspaces.tsx](client/app/%28app%29/workspaces.tsx), [workspace-settings.tsx](client/app/%28app%29/workspace-settings.tsx), [WorkspaceModal.tsx](client/components/organisms/WorkspaceModal.tsx) | [WorkspaceEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Workspaces/WorkspaceEndpoint.cs) |
| Kategorie / statusy | [categories.tsx](client/app/%28app%29/categories.tsx), [statuses.tsx](client/app/%28app%29/statuses.tsx), [SystemDefinitionsScreen.tsx](client/components/organisms/SystemDefinitionsScreen.tsx) | `Application/Tasks/Categories/*`, `Application/Tasks/TaskStatuses/*` |
| Plany/subskrypcje + admin | [admin-plans.tsx](client/app/%28app%29/admin-plans.tsx), [admin-users.tsx](client/app/%28app%29/admin-users.tsx), [PlanUsageBar.tsx](client/components/molecules/PlanUsageBar.tsx), [AiLimitInfo.tsx](client/components/molecules/AiLimitInfo.tsx) | [PlanEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Plan/PlanEndpoint.cs), [AdminEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Admin/AdminEndpoint.cs) |
| Ankiety (onboarding + admin) | [surveys.tsx](client/app/%28app%29/surveys.tsx), [survey-onboarding.tsx](client/app/%28app%29/survey-onboarding.tsx), `admin-survey-*` | `Endpoints/Surveys/*`, `Application/Surveys/*` |
| Dashboard / powiadomienia / szukanie | [dashboard.tsx](client/app/%28app%29/dashboard.tsx), [notifications.tsx](client/app/%28app%29/notifications.tsx), [search.tsx](client/app/%28app%29/search.tsx), [SearchModal.tsx](client/components/organisms/SearchModal.tsx) | brak — wyliczane po stronie klienta |


## 🚀 Deployment / CI

- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) (trigger: push do `main` na ścieżkach `DotNetServer/**`, `client/{app,components,lib,electron,assets}/**`, configi, compose). `dorny/paths-filter` decyduje, czy budować front, backend, czy oba.
- Joby: build desktop (Windows NSIS na `windows-latest`, macOS DMG arm64) → artefakty; build & push obrazów Docker (backend + frontend) → deploy `docker-compose-prod.yml`.
- Produkcja: [docker-compose-prod.yml](docker-compose-prod.yml) — obrazy z Docker Hub, za Traefik (`ordovita.pl` + `www`), env z sekretów GitHuba, backend z limitem 768 MB RAM.
- Healthcheck backendu: `GET /health` → `ok` (używany też jako `depends_on` frontu).

---

## 📓 Changelog

> Dopisuj na górze: `YYYY-MM-DD — co i gdzie`. Krótko.

- **2026-08-11** — Komentarze zadania sortowane **od najnowszych**. Kolejność ustawiał backend (`OrderBy(CreatedAt)` w `GetTaskCommentsHandler`), a komponent renderował listę as-is, więc nowy komentarz lądował na dole. Odwrócone w `TaskCommentsSection` ([TaskModals.tsx](client/components/organisms/TaskModals.tsx)), nie w handlerze — kolejność wyświetlania to decyzja prezentacji, nie kontrakt endpointu.
- **2026-08-11** — Zakładka „Historia" w modalu zadania (read-only: oś czasu wersji, wiersz „pole: stara → nowa wartość", bez podglądu/porównywania/przywracania). Frontend-only — backend (`GET /task/{taskId}/history`, `GetTaskHistoryHandler`, agregat `TaskHistory`) już istniał i jest zarejestrowany. Nowe: [TaskHistorySection.tsx](client/components/molecules/TaskHistorySection.tsx), typy `TaskHistoryEntry`/`TaskHistoryRecord`/`HistoryAction`, `mapTaskHistoryDto`, `taskApi.getHistory`, hook `useTaskHistory`, klucz `["taskHistory", wsId, taskId]`, i18n `history.*` + `priority.*` (683 klucze × 2 języki, parytet OK). Zakładka widoczna tylko dla zapisanych, zaakceptowanych zadań. Nowe pułapki 21–23. Czas względny liczony ręcznie z kluczy i18n, bo `Intl.RelativeTimeFormat` nie jest gwarantowany w Hermesie.
- **2026-08-11** — Fix: numeracja wersji historii zaczyna się od v1. `CreateWorkTaskHandler` przekazywał do `TaskHistory.Create` wersję `1`, a domena robi `version++` — wpis `CREATE` zapisywał się więc jako `VersionNumber = 2` i żadne zadanie nie miało v1. Zmienione na `0`; logika inkrementacji celowo zostaje w domenie. Zadania sprzed poprawki zachowują start od v2.
- **2026-08-11** — Fix regresji z 2026-07-29: [TaskModals.tsx](client/components/organisms/TaskModals.tsx) wołał `useLocale()` bez importu — cofnięcie omyłkowej zmiany nazwy komponentu zabrało też linię importu. `tsc` to zgłaszał, ale zmiana poszła na `main` bez ponownego sprawdzenia, a Metro nie typechecku­je, więc na produkcji otwarcie szczegółów zadania rzucało `ReferenceError`.
- **2026-08-04** — Komentarze do tasków (sekcja „Komentarze” **w zakładce Szczegóły** modala [TaskModals.tsx](client/components/organisms/TaskModals.tsx), komponent `TaskCommentsSection`; dodawanie/edycja/usuwanie — edytować/usuwać może tylko autor, dodać każdy z dostępem do workspace). Backend: encja `TaskComment` (agregat `WorkTask`), migracja `AddTaskComments`, endpointy `GET/POST/PUT/DELETE /task/{id}/comments` w [WorkspaceTasksEndpoint.cs](DotNetServer/Ordovita.Api/Endpoints/Tasks/WorkspaceTasksEndpoint.cs), CQRS w `Application/Tasks/Comments/*`. ⚠️ Handlery CQRS rejestruje się **ręcznie** w [DependencyInjection.cs](DotNetServer/Ordovita.Application/DependencyInjection.cs) (brak auto-scanu) — pominięcie = 500 „No service for type IQueryHandler…”. Frontend: `taskApi.get/add/edit/deleteComment`, hooki `useTaskComments/useAddComment/useEditComment/useDeleteComment`, typ `TaskComment`, i18n `comments.*`. **Fix logowania (2 przyczyny):** (1) interceptor axios ([client.ts](client/lib/api/client.ts)) pomija flow refresh tokenu dla `/identity/*`; (2) `login` w [auth.ts](client/lib/stores/auth.ts) NIE ustawia już globalnego `isLoading` podczas sprawdzania hasła — wcześniej `AuthGate` odmontowywał formularz i pokazywał loader, gubiąc błąd. Globalny loader włącza się dopiero po udanym uwierzytelnieniu.
- **2026-06-29** — Utworzono `CLAUDE.md`. Zaimplementowano (frontend-only): zaznaczenie „dziś" w kalendarzu (tinta kolumny, kółko w nagłówku, linia „teraz"), fix scrolla/tap na mobile web, resize wklejonych obrazków w notatkach, filtr zadań po przypisanym userze (+„Nieprzypisane"), druk kalendarza (3 motywy, siatka godzinowa). Fixy: ukrywanie pustego paska all-day, pierwsza etykieta godziny nie nachodzi na all-day, kanon kolejności kolumn kanban (klucz `…-v2`), cień na wybranym dniu (mobile 3-day).

---

_Last updated: 2026-08-04_
