import React from "react";

/**
 * Input — surface field with a 1px border and no focus ring (Arena strips
 * outlines). Optional leading Material Icon. Placeholder uses tertiary text.
 */
export function Input({
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  label,
  error,
  ...rest
}) {
  return (
    <label style={{ display: "block", width: "100%" }}>
      {label && (
        <span
          style={{
            display: "block",
            marginBottom: 8,
            fontFamily: "var(--font-label)",
            fontWeight: 500,
            fontSize: 14,
            color: "var(--text-secondary)",
          }}
        >
          {label}
        </span>
      )}
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          minHeight: 48,
          padding: "0 14px",
          background: "var(--surface-card)",
          border: `1px solid ${error ? "rgba(192,57,43,0.4)" : "var(--border-card)"}`,
          borderRadius: "var(--radius-md)",
          boxSizing: "border-box",
        }}
      >
        {icon && (
          <span
            className="material-icons"
            style={{ fontSize: 20, color: "var(--text-tertiary)" }}
          >
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-body)",
            fontSize: 16,
            color: "var(--text-body)",
            padding: "12px 0",
          }}
          {...rest}
        />
      </span>
      {error && (
        <span
          style={{
            display: "block",
            marginTop: 4,
            fontSize: 12,
            color: "var(--color-error)",
          }}
        >
          {error}
        </span>
      )}
    </label>
  );
}
