import React from "react";
import { Card } from "../../components/core/Card.jsx";
import { Badge } from "../../components/core/Badge.jsx";

function Stat({ icon, value, label, iconBg, iconColor }) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 150,
        padding: 20,
        borderRadius: "var(--radius-xl)",
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 110,
      }}
    >
      <span
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-lg)",
          background: iconBg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          className="material-icons"
          style={{ fontSize: 18, color: iconColor }}
        >
          {icon}
        </span>
      </span>
      <div>
        <div
          style={{
            fontFamily: "var(--font-headline)",
            fontWeight: 500,
            fontSize: 24,
            color: "var(--text-body)",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            marginTop: 4,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function TaskRow({ priority, tone, title, due, dueTone }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge tone={tone} label={priority} />
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--text-secondary)",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "var(--text-accent)",
              }}
            />{" "}
            Product
          </span>
        </div>
        <div style={{ fontSize: 14, color: "var(--text-body)" }}>{title}</div>
        <div style={{ fontSize: 12, color: dueTone || "var(--text-tertiary)" }}>
          {due}
        </div>
      </div>
    </div>
  );
}

function EventRow({ time, title }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "10px 0",
      }}
    >
      <div
        style={{
          width: 4,
          height: 36,
          borderRadius: 2,
          background: "var(--color-events)",
        }}
      />
      <div>
        <div style={{ fontSize: 14, color: "var(--text-body)" }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
          {time}
        </div>
      </div>
    </div>
  );
}

/**
 * DashboardScreen — greeting, the four stat cards, a "today" task list and the
 * upcoming schedule. Mirrors app/(app)/dashboard.tsx.
 */
export function DashboardScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div
          style={{
            fontFamily: "var(--font-serif-display)",
            fontSize: 32,
            lineHeight: "40px",
            color: "var(--text-body)",
          }}
        >
          Good morning, Mateusz
        </div>
        <div
          style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 2 }}
        >
          Saturday, Jun 21
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <Stat
          icon="today"
          value="3"
          label="Tasks today"
          iconBg="#f3f4f6"
          iconColor="#111111"
        />
        <Stat
          icon="event"
          value="2"
          label="Upcoming events"
          iconBg="#fff0f0"
          iconColor="#dc2c4f"
        />
        <Stat
          icon="auto_awesome"
          value="4"
          label="AI pending"
          iconBg="rgba(91,78,224,0.10)"
          iconColor="#5b4ee0"
        />
        <Stat
          icon="date_range"
          value="11"
          label="This week"
          iconBg="#ecfdf5"
          iconColor="#2E7D52"
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 2,
            minWidth: 320,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-headline)",
              fontWeight: 500,
              fontSize: 16,
            }}
          >
            To do
          </div>
          <TaskRow
            priority="High"
            tone="critical"
            title="Draft Q3 product roadmap"
            due="Due today · 45 min"
            dueTone="var(--color-warning)"
          />
          <TaskRow
            priority="Medium"
            tone="warning"
            title="Review onboarding survey results"
            due="Tomorrow"
          />
          <TaskRow
            priority="Low"
            tone="neutral"
            title="Reply to design feedback"
            due="Fri, Jun 27"
          />
        </div>
        <div style={{ flex: 1, minWidth: 260 }}>
          <Card>
            <div
              style={{
                fontFamily: "var(--font-headline)",
                fontWeight: 500,
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              Schedule
            </div>
            <EventRow time="14:00 – 14:30" title="Team sync" />
            <div style={{ height: 1, background: "var(--border-divider)" }} />
            <EventRow time="16:00 – 17:00" title="Roadmap review" />
          </Card>
        </div>
      </div>
    </div>
  );
}
