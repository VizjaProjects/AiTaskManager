import React from "react";

const NAV = [
  { icon: "dashboard", label: "Dashboard", key: "dashboard" },
  { icon: "auto_awesome", label: "AI Task", key: "ai" },
  { icon: "calendar_today", label: "Calendar", key: "calendar" },
  { icon: "checklist", label: "Tasks", key: "tasks" },
  { icon: "sticky_note_2", label: "Notes", key: "notes" },
  { icon: "tune", label: "Categories & Statuses", key: "settings" },
  {
    icon: "bar_chart",
    label: "Statistics",
    key: "stats",
    badge: "In progress",
  },
];

/**
 * Sidebar — the 256px app rail: logo, workspace switcher, nav, logout.
 * Active row uses the `active` surface; the AI row icon picks up no special
 * color here (accent is reserved for the AI Task content itself).
 */
export function Sidebar({ active = "dashboard", onNavigate }) {
  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        background: "var(--surface-sidebar)",
        borderRight: "1px solid var(--border-divider)",
        padding: "16px 12px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 8px 16px",
          }}
        >
          <img
            src="../../assets/logo/ordovita-mark.png"
            alt=""
            style={{ width: 32, height: 32, borderRadius: 7 }}
          />
          <div>
            <div
              style={{
                fontFamily: "var(--font-serif-display)",
                fontSize: 18,
                color: "var(--text-body)",
              }}
            >
              Ordovita
            </div>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
              Premium AI Workspace
            </div>
          </div>
        </div>

        <button
          type="button"
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 10px",
            marginBottom: 16,
            background: "var(--surface-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            color: "var(--text-body)",
          }}
        >
          <span
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              background: "var(--text-accent)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 10,
              fontWeight: 600,
            }}
          >
            O
          </span>
          <span
            style={{
              flex: 1,
              textAlign: "left",
              fontFamily: "var(--font-headline)",
              fontWeight: 500,
              fontSize: 13,
            }}
          >
            Ordovita HQ
          </span>
          <span
            className="material-icons"
            style={{ fontSize: 18, color: "var(--text-tertiary)" }}
          >
            unfold_more
          </span>
        </button>

        <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {NAV.map((item) => {
            const isActive = item.key === active;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onNavigate && onNavigate(item.key)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 14px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  background: isActive
                    ? "var(--surface-active)"
                    : "transparent",
                }}
              >
                <span
                  className="material-icons"
                  style={{
                    fontSize: 18,
                    color: isActive
                      ? "var(--text-body)"
                      : "var(--text-secondary)",
                  }}
                >
                  {item.icon}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontFamily: isActive
                      ? "var(--font-headline)"
                      : "var(--font-body)",
                    fontWeight: isActive ? 500 : 400,
                    color: isActive
                      ? "var(--text-body)"
                      : "var(--text-secondary)",
                  }}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      padding: "2px 6px",
                      borderRadius: "var(--radius-sm)",
                      background: "var(--surface-hover)",
                      border: "1px solid var(--border-card)",
                      color: "var(--text-tertiary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div
        style={{ borderTop: "1px solid var(--border-divider)", paddingTop: 12 }}
      >
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            width: "100%",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            borderRadius: "var(--radius-md)",
            color: "var(--text-secondary)",
          }}
        >
          <span className="material-icons" style={{ fontSize: 18 }}>
            logout
          </span>
          <span style={{ fontSize: 14, fontFamily: "var(--font-body)" }}>
            Log out
          </span>
        </button>
      </div>
    </aside>
  );
}
