**Badge** — a small pill status label; use for priority, status, category, or AI markers. One tone per role — never represent a single role with two colors.

```jsx
<Badge tone="critical" label="High" />
<Badge tone="success" label="Done" icon="check" />
<Badge ai />
```

Tones map to the semantic palette (`accent`, `critical`, `warning`, `success`, `events`, `neutral`). Labels are uppercase Inter-medium in a `rounded-full` pill. Never use emoji — use a Material Icon.
