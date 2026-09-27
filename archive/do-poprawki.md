# Do poprawki później

Rzeczy znalezione przy innej pracy. Zrobione przenoś do dziennika dnia (`archive/RRRR-MM-DD.md`) i usuwaj stąd.

- [ ] **Test z prawdziwym backendem**: przeciąganie w kanbanie, kroki (też zmiana kolejności), generowanie planu, akceptacja/odrzucenie propozycji, „Oznacz jako zakończone”, zamykanie okna wydarzenia. **Test natywny** — szczególnie `color-mix` w klasach z przezroczystością (na native NativeWind może go nie obsłużyć; wtedy klasa jest pomijana, czyli jak przed poprawką). *(2026-09-27)*
- [ ] **Okna tworzenia i edycji wydarzenia nie zamykają się klawiszem Esc** — `AppModal` w kalendarzu nie dostaje `onRequestClose`. *(2026-09-27)*
- [ ] **Surowe hexy w pozostałych plikach**: ~395 wystąpień w 63 plikach (część to legalne palety: kolory wydarzeń, atrament, e-maile, brand). Do przejrzenia plik po pliku z `getUiTokens`; np. `TaskStepsSection` (`#9b9791`, `#C0392B`, `#6b6965`), biały plus na przyciskach akcentu w kalendarzu. *(2026-09-27)*
- [ ] **`surveys.tsx`**: generyczne kolory Tailwinda (`green-500`, `blue-…` itd., 7 miejsc), zakazane w DS. *(2026-09-27)*
- [ ] **Kroki w formularzu tworzenia zadania** (`DraftTaskStepsEditor`) mają klucze po indeksie — zmiana kolejności nie może się animować. *(2026-09-27)*
