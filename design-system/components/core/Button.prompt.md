**Button** — the Arena action primitive; use for any tappable action, with `primary` (ink) reserved for the single dominant action on a view.

```jsx
<Button variant="primary" label="Sign Up" icon="arrow_forward" onClick={start} />
<Button variant="secondary" label="Log In" />
<Button variant="ai" label="Plan my day" />
<Button variant="error" label="Delete" icon="delete" />
```

Variants: `primary` (ink fill), `secondary`/`outline` (surface + 1px border), `error` (surface + red border/text), `ai` (surface + accent `auto_awesome`), `text` (bare). Sizes: `sm`, `md`. Never use a heavier weight than medium; radius stays at `--radius-md` (6px).
