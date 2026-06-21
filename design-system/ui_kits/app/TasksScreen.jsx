import React from "react";
import { Badge } from "../../components/core/Badge.jsx";
import { Avatar } from "../../components/core/Avatar.jsx";

function KanbanCard({ priority, tone, title, due, ai, who }) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-kanban)",
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Badge tone={tone} label={priority} />
        {ai && <Badge ai />}
      </div>
      <div style={{ fontSize: 14, color: "var(--text-body)" }}>{title}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
          {due}
        </span>
        <div style={{ flex: 1 }} />
        {who && <Avatar name={who} size="sm" />}
      </div>
    </div>
  );
}

function Column({ title, count, accent, children }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 240,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: accent,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-headline)",
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          {title}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
          {count}
        </span>
      </div>
      {children}
    </div>
  );
}

/** TasksScreen — the three-column Kanban board. Mirrors app/(app)/tasks.tsx. */
export function TasksScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              background: "var(--color-accent-tint-08)",
              color: "var(--text-accent)",
              fontSize: 12,
              fontFamily: "var(--font-label)",
              fontWeight: 500,
            }}
          >
            All
          </span>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-card)",
              color: "var(--text-secondary)",
              fontSize: 12,
            }}
          >
            Mine
          </span>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: "var(--radius-full)",
              border: "1px solid var(--border-card)",
              color: "var(--text-secondary)",
              fontSize: 12,
            }}
          >
            High priority
          </span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        <Column title="To do" count="3" accent="var(--text-tertiary)">
          <KanbanCard
            priority="High"
            tone="critical"
            title="Draft Q3 product roadmap"
            due="Today"
            who="Mateusz Barlik"
          />
          <KanbanCard
            priority="Medium"
            tone="warning"
            title="Review survey results"
            due="Tomorrow"
            ai
          />
          <KanbanCard
            priority="Low"
            tone="neutral"
            title="Reply to design feedback"
            due="Fri"
          />
        </Column>
        <Column title="In progress" count="2" accent="var(--color-warning)">
          <KanbanCard
            priority="High"
            tone="critical"
            title="Migrate inline hex to tokens"
            due="Today"
            who="Alex Rivera"
          />
          <KanbanCard
            priority="Medium"
            tone="warning"
            title="Calendar month view polish"
            due="Wed"
          />
        </Column>
        <Column title="Done" count="2" accent="var(--color-success)">
          <KanbanCard
            priority="Low"
            tone="neutral"
            title="Ship landing page reskin"
            due="Jun 18"
            who="Mateusz Barlik"
          />
          <KanbanCard
            priority="Medium"
            tone="warning"
            title="Workspace visibility toggle"
            due="Jun 17"
          />
        </Column>
      </div>
    </div>
  );
}
