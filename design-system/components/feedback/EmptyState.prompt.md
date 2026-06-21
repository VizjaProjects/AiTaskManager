**EmptyState** — a quiet placeholder when a list or screen has no content; use instead of a blank area. No illustration, just a muted icon + a clear next step.

```jsx
<EmptyState
  icon="checklist"
  title="No tasks yet"
  description="Create your first task or ask AI to plan your day."
  action={<Button variant="ai" label="Plan my day" />}
/>
```
