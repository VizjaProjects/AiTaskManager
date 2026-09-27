# Do poprawki później

Rzeczy znalezione przy innej pracy. Zrobione przenoś do dziennika dnia (`archive/RRRR-MM-DD.md`) i usuwaj stąd.

- [ ] **Kolory z przezroczystością nie działają** (`border-outline-variant/70`, `bg-surface-container-low/40`…): tokeny w `client/tailwind.config.js` to gołe `var(--color-…)` bez `<alpha-value>`, więc ramki robią się czarne, a tła znikają. ~58 miejsc w 22 plikach. Naprawić raz w konfiguracji (np. kanały RGB w `global.css` + `rgb(var(--…) / <alpha-value>)`). *(2026-09-27)*
- [ ] **`Skeleton.tsx`** używa `className` na `Animated.View`, a NativeWind go tam nie stosuje — placeholdery ładowania prawdopodobnie nie mają koloru. Sprawdzić. *(2026-09-27)*
- [ ] **Okno edycji wydarzenia w kalendarzu** montowane warunkowo (`{editingEvent && …}`) — wchodzi z animacją, znika od razu. *(2026-09-26)*
- [ ] **`AiProposedCard`**: surowe hexy ikon (`#9b9791`, `#C0392B`, `#f0f0f0`) zamiast tokenów. *(2026-09-26)*
- [ ] **Kalendarz — surowe kolory**: `cellBorder = "#e5e7eb"` (generyczna szarość Tailwinda, zakazana w DS), `gridBorderColor`/`gridLineColor`, `accentColor` i `#9b9791` w ikonach zaszyte w `calendar.tsx` zamiast tokenów / `getUiTokens`. Podobnie `accentColor`, `mutedIcon`, `#9b9791` w `tasks.tsx`. *(2026-09-27)*
- [ ] **Kalendarz — tryb miesiąca i wydarzenia całodniowe nie mają obwódki „wylądowało”** (jest tylko w siatce godzinowej: dzień/tydzień i widoki telefonu). *(2026-09-27)*
- [ ] **Kalendarz — tytuł tygodnia** pokazuje „21 września – 2026 (dzień: 27)”: `formatCalendarTitle` formatuje koniec tygodnia jako `{ day, year }`, a ICU dla `pl` bez miesiąca daje taki dziwny zapis. *(2026-09-27)*
- [ ] **`AiLimitInfo`**: napis „{n} left” zaszyty po angielsku (poza i18n); dymek otwiera się bez animacji (pozostałe menu już rosną z przycisku). *(2026-09-27)*
- [ ] **`PlanUsageBar`**: surowe hexy (`#C0392B`, `#B7770D`, akcent) mimo komentarza „Arena tokens only”. *(2026-09-27)*
- [ ] **`NotesScreen`**: „Ładowanie…” zaszyte po polsku (poza i18n). *(2026-09-27)*
- [ ] **Ostrzeżenie React „`<button>` cannot be a descendant of `<button>`”** przy otwartym menu użytkownika (`UserMenu`: tło `Pressable accessibilityRole="button"` zawiera przyciski). Struktura sprzed zmian — prawdopodobnie istniało wcześniej; sprawdzić. *(2026-09-27)*
- [ ] **Kroki — zmiana kolejności** (strzałki góra/dół) przeskakuje bez animacji. *(2026-09-27)*
- [ ] **Test z prawdziwym backendem**: przeciąganie w kanbanie, kroki, generowanie planu, akceptacja/odrzucenie propozycji, „Oznacz jako zakończone”. **Test natywny.** *(2026-09-27)*
