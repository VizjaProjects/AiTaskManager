**Toast** — a transient floating confirmation or error; use after an action (saved, deleted, AI finished). It's an elevated layer, so it carries a soft shadow.

```jsx
<Toast tone="success" message="Task saved." onDismiss={hide} />
<Toast tone="error" message="Couldn't reach the server." />
```

Tones: `success`, `error`, `info` (accent `auto_awesome`). Only the icon is colored — text stays ink.
