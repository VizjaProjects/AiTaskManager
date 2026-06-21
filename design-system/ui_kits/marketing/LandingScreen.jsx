import React from "react";
import { Button } from "../../components/core/Button.jsx";

function Logo({ size = 32, tagline }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <img
        src="../../assets/logo/ordovita-mark.png"
        alt=""
        style={{ width: size, height: size, borderRadius: size * 0.22 }}
      />
      <div>
        <div
          style={{
            fontFamily: "var(--font-serif-display)",
            fontSize: size * 0.56,
            color: "var(--text-body)",
          }}
        >
          Ordovita
        </div>
        {tagline && (
          <div style={{ fontSize: 10, color: "var(--text-tertiary)" }}>
            Premium AI Workspace
          </div>
        )}
      </div>
    </div>
  );
}

function DownloadButton({ icon, label }) {
  return (
    <button
      type="button"
      style={{
        flex: 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-landing)",
        padding: "16px 24px",
        cursor: "pointer",
        color: "var(--text-body)",
        fontFamily: "var(--font-headline)",
        fontWeight: 500,
        fontSize: 14,
      }}
    >
      <span className="material-icons" style={{ fontSize: 20 }}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function FocusCard({ icon, title, desc }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 200,
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-landing)",
        padding: 24,
      }}
    >
      <span
        className="material-icons"
        style={{ fontSize: 22, color: "var(--text-accent)" }}
      >
        {icon}
      </span>
      <div
        style={{
          fontFamily: "var(--font-headline)",
          fontWeight: 500,
          fontSize: 16,
          marginTop: 12,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 14,
          color: "var(--text-secondary)",
          marginTop: 6,
          lineHeight: 1.5,
        }}
      >
        {desc}
      </div>
    </div>
  );
}

/**
 * LandingScreen — the ordovita.pl marketing page: header, serif hero with one
 * accent word, desktop download buttons, app preview, feature cards, footer.
 * Mirrors client/app/index.tsx. Marketing cards use real (soft) shadow.
 */
export function LandingScreen() {
  const MAX = {
    maxWidth: "var(--content-max-width)",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  };
  return (
    <div
      style={{
        background: "var(--surface-page)",
        color: "var(--text-body)",
        minHeight: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          ...MAX,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 24px",
        }}
      >
        <Logo size={36} />
        <div style={{ display: "flex", gap: 12 }}>
          <Button variant="outline" label="Log In" />
          <Button variant="primary" label="Sign Up" icon="arrow_forward" />
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          ...MAX,
          padding: "48px 24px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 24,
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-accent-tint-08)",
          }}
        >
          <span
            className="material-icons"
            style={{ fontSize: 13, color: "var(--text-accent)" }}
          >
            auto_awesome
          </span>
          <span
            style={{
              fontFamily: "var(--font-label)",
              fontWeight: 500,
              fontSize: 12,
              letterSpacing: "0.05em",
              color: "var(--text-accent)",
            }}
          >
            Ordovita v2.0 is now live
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif-display)",
            fontSize: 48,
            lineHeight: "56px",
            letterSpacing: "-0.02em",
            maxWidth: 720,
          }}
        >
          Your Premium{" "}
          <span style={{ color: "var(--text-accent)" }}>Workspace</span> for
          Ultimate Clarity.
        </div>
        <div
          style={{
            fontSize: 16,
            lineHeight: "24px",
            color: "var(--text-secondary)",
            maxWidth: 560,
          }}
        >
          Minimalist task management. Reduce cognitive load, focus on what
          matters, and organize your day with clarity.
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 8,
            width: "100%",
            maxWidth: 560,
          }}
        >
          <DownloadButton icon="desktop_windows" label="Download for Windows" />
          <DownloadButton icon="laptop_mac" label="Download for macOS" />
        </div>
        <div style={{ fontSize: 14, color: "var(--text-tertiary)" }}>
          Also available on web · Free 14-day trial
        </div>
      </div>

      {/* App preview */}
      <div style={{ ...MAX, padding: "0 24px 64px" }}>
        <div
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-landing)",
            padding: 28,
            display: "flex",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 176,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <Logo size={28} tagline />
            <div
              style={{
                height: 1,
                background: "var(--border-card)",
                margin: "4px 0",
              }}
            />
            {["Dashboard", "Tasks", "Calendar"].map((x, i) => (
              <div
                key={x}
                style={{
                  padding: "8px 10px",
                  borderRadius: "var(--radius-md)",
                  background: i === 0 ? "var(--surface-active)" : "transparent",
                  fontSize: 13,
                  color: i === 0 ? "var(--text-body)" : "var(--text-secondary)",
                }}
              >
                {x}
              </div>
            ))}
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <div
              style={{ fontFamily: "var(--font-serif-display)", fontSize: 22 }}
            >
              Good morning, Mateusz
            </div>
            {[
              "Draft Q3 roadmap · Due today",
              "Team sync · 14:00",
              "Review survey results",
            ].map((x) => (
              <div
                key={x}
                style={{
                  padding: "12px 14px",
                  background: "var(--surface-card)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "var(--radius-md)",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                }}
              >
                {x}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div
        style={{
          ...MAX,
          padding: "0 24px 64px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-serif-display)",
            fontSize: 24,
            textAlign: "center",
          }}
        >
          Designed for Focus
        </div>
        <div
          style={{
            fontSize: 16,
            color: "var(--text-secondary)",
            textAlign: "center",
            maxWidth: 520,
          }}
        >
          Everything you need to manage complex workflows, without the visual
          clutter.
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 24, width: "100%" }}>
          <FocusCard
            icon="checklist"
            title="Task Management"
            desc="Kanban, filters, priorities — all in one place."
          />
          <FocusCard
            icon="calendar_today"
            title="Smart Calendar"
            desc="Plan your day with events and a clear month view."
          />
          <FocusCard
            icon="auto_awesome"
            title="AI Planning"
            desc="Natural-language task creation and smart suggestions."
          />
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border-card)" }}>
        <div
          style={{
            ...MAX,
            padding: "32px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Logo size={28} />
          <div
            style={{
              display: "flex",
              gap: 24,
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            <span>Log In</span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>kontakt@ordovita.pl</span>
          </div>
        </div>
        <div
          style={{
            ...MAX,
            padding: "0 24px 32px",
            fontSize: 12,
            color: "var(--text-tertiary)",
          }}
        >
          © 2026 Ordovita · ordovita.pl
        </div>
      </div>
    </div>
  );
}
