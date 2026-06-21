**Input** — a single-line text field; use for any short text entry. Surface fill, 1px border, no focus ring (Arena strips outlines on purpose).

```jsx
<Input label="Email" icon="mail" placeholder="you@ordovita.pl" value={email} onChange={setEmail} />
<Input placeholder="Search tasks" icon="search" />
```

Pass `error` to turn the border red and render a message. Placeholder text uses the tertiary ink token.
