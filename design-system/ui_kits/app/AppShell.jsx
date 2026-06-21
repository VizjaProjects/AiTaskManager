import React from "react";
import { Sidebar } from "./Sidebar.jsx";

/**
 * AppShell — the Arena app frame: fixed sidebar + a top bar (page title, search,
 * theme toggle, avatar) over a cream-paper content well capped at max-w-5xl.
 */
export function AppShell({
  active,
  onNavigate,
  title,
  onToggleTheme,
  children,
}) {
  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        background: "var(--surface-page)",
        color: "var(--text-body)",
      }}
    >
      <Sidebar active={active} onNavigate={onNavigate} />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "0 24px",
            height: 60,
            borderBottom: "1px solid var(--border-divider)",
            background: "var(--surface-page)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-serif-display)",
              fontSize: 22,
              color: "var(--text-body)",
            }}
          >
            {title}
          </div>
          <div style={{ flex: 1 }} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 220,
              padding: "0 12px",
              height: 38,
              background: "var(--surface-card)",
              border: "1px solid var(--border-card)",
              borderRadius: "var(--radius-input)",
            }}
          >
            <span
              className="material-icons"
              style={{ fontSize: 18, color: "var(--text-tertiary)" }}
            >
              search
            </span>
            <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>
              Search…
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-md)",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="material-icons" style={{ fontSize: 20 }}>
              dark_mode
            </span>
          </button>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--radius-full)",
              background: "var(--color-primary-fixed)",
              color: "var(--text-body)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-headline)",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            MB
          </div>
        </header>
        <main style={{ flex: 1, overflow: "auto", padding: "28px 24px" }}>
          <div
            style={{ maxWidth: "var(--content-max-width)", margin: "0 auto" }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
