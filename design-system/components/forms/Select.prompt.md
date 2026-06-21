**Select** — a minimal single-choice dropdown; use for pickers (status, category, model). The trigger is flat (bordered surface); the open menu is an elevated floating layer (soft shadow).

```jsx
<Select
  value={status}
  onChange={setStatus}
  icon="tune"
  options={[
    { value: "todo", label: "To do" },
    { value: "doing", label: "In progress" },
  ]}
/>
```

The selected row uses the accent tint background + accent edge border, matching the app's `MinimalSelectDropdown`.
