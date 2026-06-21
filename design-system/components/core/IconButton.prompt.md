**IconButton** — a bare, square tap target for one Material Icon; use for toolbar actions, close buttons, and row affordances where a label would be noise.

```jsx
<IconButton icon="close" title="Close" onClick={dismiss} />
<IconButton icon="auto_awesome" accent title="Ask AI" />
```

No fill at rest; surface-hover on hover. Set `accent` to tint the glyph violet (e.g. AI affordances).
