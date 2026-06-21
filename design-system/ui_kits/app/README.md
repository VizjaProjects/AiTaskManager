# Ordovita App — UI kit

An interactive, click-through recreation of the Ordovita desktop/web app
(Expo / React Native Web). Composes the design-system primitives over the Arena
foundations. Recreated from the real source under `client/app/(app)` and
`client/components`.

## Open

`index.html` — boots the app shell with working sidebar navigation and a
light/dark toggle. Three surfaces are recreated; other nav items fall back to
the dashboard.

## Screens

- `Sidebar.jsx` — 256px rail: logo, workspace switcher, nav, log out. Active row uses the `active` surface. (from `SideNavBar.tsx` / `NavItem.tsx`)
- `AppShell.jsx` — sidebar + top bar (page title in Playfair, search, theme toggle, avatar) over a `max-w-5xl` content well. (from `PageLayout.tsx` / `AppHeader.tsx`)
- `DashboardScreen.jsx` — greeting, four stat cards, today's tasks, schedule. (from `dashboard.tsx` / `StatCard.tsx`)
- `TasksScreen.jsx` — three-column Kanban with priority badges, AI tags, assignee avatars; board cards carry the kanban shadow. (from `tasks.tsx` / `TaskCard.tsx`)
- `AiTaskScreen.jsx` — natural-language planner with the accent AI affordance and accept/reject proposed tasks & events. (from `ai-task.tsx` / `AiProposedCard.tsx`)

## Notes

- Flat in-app surfaces: cards are defined by a 1px border. Only the Kanban board uses a (subtle) shadow.
- Icons are Material Icons (the app's `@expo/vector-icons` set), served here from the Google Fonts Material Icons webfont.
- These are cosmetic recreations — interactions are faked; no real data or network.
