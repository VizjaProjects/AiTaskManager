import React from "react";
import { Button } from "../../components/core/Button.jsx";
import { Badge } from "../../components/core/Badge.jsx";

function ProposedCard({ kind, title, meta }) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        padding: 14,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span
        className="material-icons"
        style={{ fontSize: 20, color: "var(--text-accent)" }}
      >
        {kind === "event" ? "event" : "task_alt"}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, color: "var(--text-body)" }}>{title}</div>
        <div
          style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}
        >
          {meta}
        </div>
      </div>
      <button
        type="button"
        style={{
          width: 34,
          height: 34,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-card)",
          background: "var(--surface-card)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-success)",
        }}
      >
        <span className="material-icons" style={{ fontSize: 18 }}>
          check
        </span>
      </button>
      <button
        type="button"
        style={{
          width: 34,
          height: 34,
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-card)",
          background: "var(--surface-card)",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-tertiary)",
        }}
      >
        <span className="material-icons" style={{ fontSize: 18 }}>
          close
        </span>
      </button>
    </div>
  );
}

/**
 * AiTaskScreen — natural-language planning. A composer with the accent AI
 * affordance, then the AI-proposed tasks/events awaiting accept/reject.
 * Mirrors app/(app)/ai-task.tsx.
 */
export function AiTaskScreen({ proposed = true }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            borderRadius: "var(--radius-full)",
            background: "var(--color-accent-tint-08)",
            marginBottom: 12,
          }}
        >
          <span
            className="material-icons"
            style={{ fontSize: 14, color: "var(--text-accent)" }}
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
            AI PLANNING
          </span>
        </div>
        <div
          style={{
            fontFamily: "var(--font-serif-display)",
            fontSize: 28,
            color: "var(--text-body)",
          }}
        >
          Describe your day
        </div>
        <div
          style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}
        >
          Write in plain language. Ordovita turns it into tasks and events.
        </div>
      </div>

      <div
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-xl)",
          padding: 16,
        }}
      >
        <div
          style={{
            fontSize: 15,
            color: "var(--text-body)",
            lineHeight: 1.6,
            minHeight: 72,
          }}
        >
          Tomorrow: finish the Q3 roadmap draft in the morning, 30-min team sync
          at 2pm, then review the onboarding survey before EOD.
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 12 }}>
          <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
            142 / 4000
          </span>
          <div style={{ flex: 1 }} />
          <Button variant="ai" label="Plan my day" />
        </div>
      </div>

      {proposed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontFamily: "var(--font-headline)",
                fontWeight: 500,
                fontSize: 15,
              }}
            >
              Proposed
            </span>
            <Badge ai />
          </div>
          <ProposedCard
            kind="task"
            title="Finish Q3 roadmap draft"
            meta="Task · High · ~90 min · morning"
          />
          <ProposedCard
            kind="event"
            title="Team sync"
            meta="Event · 14:00 – 14:30"
          />
          <ProposedCard
            kind="task"
            title="Review onboarding survey"
            meta="Task · Medium · before EOD"
          />
        </div>
      )}
    </div>
  );
}
