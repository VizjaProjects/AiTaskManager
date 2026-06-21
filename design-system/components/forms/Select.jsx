import React from "react";

/**
 * Select — a minimal dropdown. The trigger is a bordered surface row; the open
 * menu floats with a soft shadow (it's an elevated layer). The selected row
 * uses the accent tint + accent edge. Theme-aware via tokens.
 */
export function Select({
  value,
  options = [],
  onChange,
  placeholder = "Select…",
  icon,
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);
  return (
    <div style={{ position: "relative", width: 240 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          background: "var(--surface-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-input)",
          cursor: "pointer",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: selected ? "var(--text-body)" : "var(--text-tertiary)",
        }}
      >
        {icon && (
          <span
            className="material-icons"
            style={{ fontSize: 18, color: "var(--text-tertiary)" }}
          >
            {icon}
          </span>
        )}
        <span style={{ flex: 1, textAlign: "left" }}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          className="material-icons"
          style={{ fontSize: 20, color: "var(--text-tertiary)" }}
        >
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            background: "var(--surface-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-menu)",
            padding: 4,
            zIndex: 10,
          }}
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange && onChange(o.value);
                  setOpen(false);
                }}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  border: `1px solid ${active ? "var(--color-accent-edge)" : "transparent"}`,
                  borderRadius: "var(--radius-sm)",
                  background: active
                    ? "var(--color-accent-tint-06)"
                    : "transparent",
                  color: active ? "var(--text-accent)" : "var(--text-body)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
