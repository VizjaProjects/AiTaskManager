/**
 * Calendar print templates (web/desktop only).
 *
 * Builds a self-contained, print-friendly HTML document for the calendar's
 * current view (day / week / month) and prints it through a hidden iframe so
 * we avoid the popup blocker that `window.open` triggers.
 *
 * Day / week render a real hourly time grid (matching the on-screen calendar)
 * with time-positioned event blocks, overlap columns and an all-day strip.
 * Month renders the 6×7 grid.
 *
 * Three selectable themes:
 *  - classic: matches the app look (accent headers, colored event pills)
 *  - mono:    black & white, hairline rules, ink-saving for B/W printers
 *  - grid:    bold bordered grid with solid colored event blocks
 */
import type { CalendarEvent } from "@/lib/types";
import { parseApiDateTime } from "@/lib/utils";
import { resolveEventColor, eventColorWithAlpha } from "@/lib/utils/eventColors";

export type PrintTheme = "classic" | "mono" | "grid";
export type PrintViewType = "day" | "week" | "month";

interface ThemeTokens {
  accent: string;
  useColor: boolean;
  headerBg: string;
  cellBorder: string;
  line: string;
  todayBg: string;
  /** how events are rendered: colored left border / hairline text / solid block */
  eventStyle: "border" | "line" | "block";
}

const THEMES: Record<PrintTheme, ThemeTokens> = {
  classic: {
    accent: "#5b4ee0",
    useColor: true,
    headerBg: "#f5f4ff",
    cellBorder: "#d9d7ee",
    line: "#ececf7",
    todayBg: "rgba(91,78,224,0.08)",
    eventStyle: "border",
  },
  mono: {
    accent: "#111111",
    useColor: false,
    headerBg: "#f4f4f4",
    cellBorder: "#bbbbbb",
    line: "#e2e2e2",
    todayBg: "rgba(0,0,0,0.05)",
    eventStyle: "line",
  },
  grid: {
    accent: "#111111",
    useColor: true,
    headerBg: "#e9e9e9",
    cellBorder: "#333333",
    line: "#cfcfcf",
    todayBg: "rgba(0,0,0,0.05)",
    eventStyle: "block",
  },
};

const WEEK_DAYS_SHORT = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

const HOUR_H = 42; // px per hour in the printed time grid
const GUTTER = 52; // px width of the left hour-label column

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isToday(day: Date): boolean {
  return isSameDay(day, new Date());
}

function eventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events
    .filter((e) => {
      const s = parseApiDateTime(e.startDateTime);
      const en = parseApiDateTime(e.endDateTime);
      return isSameDay(s, day) || isSameDay(en, day);
    })
    .sort(
      (a, b) =>
        parseApiDateTime(a.startDateTime).getTime() -
        parseApiDateTime(b.startDateTime).getTime(),
    );
}

/** Start/end hour of an event clamped to the given day [0..24]. */
function eventHours(
  evt: CalendarEvent,
  day: Date,
): { start: number; end: number } {
  const s = parseApiDateTime(evt.startDateTime);
  const en = parseApiDateTime(evt.endDateTime);
  const start = isSameDay(s, day) ? s.getHours() + s.getMinutes() / 60 : 0;
  let end = isSameDay(en, day) ? en.getHours() + en.getMinutes() / 60 : 24;
  if (end <= start) end = Math.min(24, start + 0.5);
  return { start, end };
}

/** Greedy side-by-side column layout for overlapping events (per day). */
function layoutColumn(
  evts: CalendarEvent[],
  day: Date,
): Map<string, { col: number; total: number }> {
  const result = new Map<string, { col: number; total: number }>();
  const sorted = [...evts].sort(
    (a, b) => eventHours(a, day).start - eventHours(b, day).start,
  );
  const groups: CalendarEvent[][] = [];
  let group: CalendarEvent[] = [];
  let groupEnd = -1;
  for (const e of sorted) {
    const { start, end } = eventHours(e, day);
    if (group.length === 0 || start < groupEnd) {
      group.push(e);
      groupEnd = Math.max(groupEnd, end);
    } else {
      groups.push(group);
      group = [e];
      groupEnd = end;
    }
  }
  if (group.length) groups.push(group);

  for (const g of groups) {
    const colEnds: number[] = [];
    for (const e of g) {
      const { start, end } = eventHours(e, day);
      let placed = false;
      for (let c = 0; c < colEnds.length; c++) {
        if (start >= colEnds[c]) {
          colEnds[c] = end;
          result.set(e.eventId, { col: c, total: 0 });
          placed = true;
          break;
        }
      }
      if (!placed) {
        colEnds.push(end);
        result.set(e.eventId, { col: colEnds.length - 1, total: 0 });
      }
    }
    for (const e of g) {
      const info = result.get(e.eventId);
      if (info) info.total = colEnds.length;
    }
  }
  return result;
}

function renderAllDayPill(evt: CalendarEvent, tokens: ThemeTokens): string {
  const color = resolveEventColor(evt);
  const title = escapeHtml(evt.title || "");
  if (tokens.eventStyle === "line")
    return `<div class="ad ad-line">${title}</div>`;
  if (tokens.eventStyle === "block")
    return `<div class="ad ad-block" style="background:${color}">${title}</div>`;
  return `<div class="ad ad-border" style="border-left-color:${color};background:${eventColorWithAlpha(
    color,
    0.15,
  )}">${title}</div>`;
}

function renderTimedEvent(
  evt: CalendarEvent,
  day: Date,
  minHour: number,
  maxHour: number,
  layout: { col: number; total: number },
  tokens: ThemeTokens,
): string {
  const color = resolveEventColor(evt);
  const { start, end } = eventHours(evt, day);
  const top = (Math.max(start, minHour) - minHour) * HOUR_H;
  const height = Math.max(
    (Math.min(end, maxHour) - Math.max(start, minHour)) * HOUR_H,
    16,
  );
  const widthPct = 100 / layout.total;
  const leftPct = layout.col * widthPct;
  const s = parseApiDateTime(evt.startDateTime);
  const en = parseApiDateTime(evt.endDateTime);
  const timeLabel = `${fmtTime(s)}–${fmtTime(en)}`;
  const title = escapeHtml(evt.title || "");

  let styleColor = "";
  let cls = "tev";
  if (tokens.eventStyle === "block") {
    cls += " tev-block";
    styleColor = `background:${color};`;
  } else if (tokens.eventStyle === "line") {
    cls += " tev-line";
  } else {
    cls += " tev-border";
    styleColor = `border-left-color:${color};background:${eventColorWithAlpha(
      color,
      0.15,
    )};`;
  }

  return `<div class="${cls}" style="${styleColor}top:${top}px;height:${height}px;left:calc(${leftPct}% + 1px);width:calc(${widthPct}% - 2px);">
    <div class="tev-time">${timeLabel}</div>
    <div class="tev-title">${title}</div>
  </div>`;
}

function renderTimeGrid(
  days: Date[],
  events: CalendarEvent[],
  tokens: ThemeTokens,
): string {
  // Determine the hour window: a sensible default band, expanded to fit events.
  let minHour = 7;
  let maxHour = 21;
  for (const day of days) {
    for (const e of eventsForDay(events, day)) {
      if (e.allDay) continue;
      const { start, end } = eventHours(e, day);
      minHour = Math.min(minHour, Math.floor(start));
      maxHour = Math.max(maxHour, Math.ceil(end));
    }
  }
  minHour = Math.max(0, minHour);
  maxHour = Math.min(24, Math.max(maxHour, minHour + 4));
  const totalH = (maxHour - minHour) * HOUR_H;

  const dayHead = days
    .map((day) => {
      const dow = day.getDay();
      const dayLabel = WEEK_DAYS_SHORT[dow === 0 ? 6 : dow - 1];
      return `<div class="dhead${isToday(day) ? " today" : ""}">
        <span class="dhead-dow">${dayLabel}</span>
        <span class="dhead-date">${day.getDate()}.${day.getMonth() + 1}</span>
      </div>`;
    })
    .join("");

  const allDayRow = days
    .map((day) => {
      const ad = eventsForDay(events, day).filter((e) => e.allDay);
      return `<div class="adcell">${ad
        .map((e) => renderAllDayPill(e, tokens))
        .join("")}</div>`;
    })
    .join("");
  const hasAllDay = days.some((d) =>
    eventsForDay(events, d).some((e) => e.allDay),
  );

  const hourLabels: string[] = [];
  for (let h = minHour; h <= maxHour; h++) {
    hourLabels.push(
      `<div class="hl" style="top:${(h - minHour) * HOUR_H}px">${String(
        h,
      ).padStart(2, "0")}:00</div>`,
    );
  }

  const cols = days
    .map((day) => {
      const timed = eventsForDay(events, day).filter((e) => !e.allDay);
      const layout = layoutColumn(timed, day);
      const blocks = timed
        .map((e) =>
          renderTimedEvent(
            e,
            day,
            minHour,
            maxHour,
            layout.get(e.eventId) ?? { col: 0, total: 1 },
            tokens,
          ),
        )
        .join("");
      return `<div class="tcol${isToday(day) ? " today" : ""}">${blocks}</div>`;
    })
    .join("");

  return `
    <div class="row head">
      <div class="gutter"></div>
      <div class="cells">${dayHead}</div>
    </div>
    ${
      hasAllDay
        ? `<div class="row allday">
        <div class="gutter lbl">cały dzień</div>
        <div class="cells">${allDayRow}</div>
      </div>`
        : ""
    }
    <div class="tgrid">
      <div class="hours" style="height:${totalH}px">${hourLabels.join("")}</div>
      <div class="tcols" style="height:${totalH}px">${cols}</div>
    </div>`;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  let dayOfWeek = firstDay.getDay();
  if (dayOfWeek === 0) dayOfWeek = 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const days: Array<{ day: number; currentMonth: boolean; date: Date }> = [];
  for (let i = dayOfWeek - 1; i > 0; i--) {
    days.push({
      day: daysInPrevMonth - i + 1,
      currentMonth: false,
      date: new Date(year, month - 1, daysInPrevMonth - i + 1),
    });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, currentMonth: true, date: new Date(year, month, i) });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      currentMonth: false,
      date: new Date(year, month + 1, i),
    });
  }
  return days;
}

function renderMonthGrid(
  selectedDate: Date,
  events: CalendarEvent[],
  tokens: ThemeTokens,
): string {
  const monthDays = getMonthDays(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
  );
  const head = WEEK_DAYS_SHORT.map((d) => `<th>${d}</th>`).join("");
  const rows = Array.from({ length: 6 }, (_, w) => {
    const cells = monthDays
      .slice(w * 7, w * 7 + 7)
      .map((d) => {
        const dayEvts = eventsForDay(events, d.date);
        const pills = dayEvts
          .slice(0, 4)
          .map((e) => {
            const color = resolveEventColor(e);
            if (tokens.eventStyle === "line")
              return `<div class="m-ev m-line">${escapeHtml(e.title)}</div>`;
            if (tokens.eventStyle === "block")
              return `<div class="m-ev m-block" style="background:${color}">${escapeHtml(
                e.title,
              )}</div>`;
            return `<div class="m-ev m-border" style="border-left-color:${color};background:${eventColorWithAlpha(
              color,
              0.15,
            )}">${escapeHtml(e.title)}</div>`;
          })
          .join("");
        const more =
          dayEvts.length > 4
            ? `<div class="m-more">+${dayEvts.length - 4}</div>`
            : "";
        const cls = [
          d.currentMonth ? "" : "muted",
          isToday(d.date) ? "today" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<td class="${cls}"><div class="m-daynum">${d.day}</div>${pills}${more}</td>`;
      })
      .join("");
    return `<tr>${cells}</tr>`;
  }).join("");
  return `<table class="month"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

export function buildCalendarPrintHtml(opts: {
  viewType: PrintViewType;
  selectedDate: Date;
  displayDays: Date[];
  events: CalendarEvent[];
  theme: PrintTheme;
  title: string;
}): string {
  const tokens = THEMES[opts.theme];
  const events = opts.events ?? [];
  const printedAt = new Date().toLocaleString("pl-PL");
  const landscape = opts.viewType !== "day";

  const content =
    opts.viewType === "month"
      ? renderMonthGrid(opts.selectedDate, events, tokens)
      : renderTimeGrid(opts.displayDays, events, tokens);

  const accentText = tokens.useColor ? tokens.accent : "#111";

  const css = `
    @page { size: ${landscape ? "landscape" : "portrait"}; margin: 10mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
      color: #111; padding: 16px;
    }
    h1 { font-size: 19px; margin: 0 0 2px; color: ${accentText}; }
    .subtitle { font-size: 11px; color: #777; margin: 0 0 14px; }

    /* shared row layout so headers / all-day / grid columns align */
    .row { display: flex; }
    .gutter { width: ${GUTTER}px; flex: none; }
    .gutter.lbl { font-size: 9px; color: #888; display: flex; align-items: center; justify-content: flex-end; padding-right: 6px; }
    .cells { flex: 1; display: flex; }

    .head .dhead {
      flex: 1; text-align: center; padding: 6px 2px;
      border: 1px solid ${tokens.cellBorder}; border-bottom: 0; border-left: 0;
      background: ${tokens.headerBg};
    }
    .head .dhead:first-child { border-left: 1px solid ${tokens.cellBorder}; }
    .head .dhead.today { background: ${tokens.todayBg}; border-top: 2px solid ${accentText}; }
    .dhead-dow { display: block; font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em;
      color: ${tokens.useColor ? tokens.accent : "#555"}; font-weight: 700; }
    .dhead-date { font-size: 14px; font-weight: 700; }

    .allday .adcell { flex: 1; min-height: 22px; padding: 3px;
      border: 1px solid ${tokens.cellBorder}; border-bottom: 0; border-left: 0; }
    .allday .adcell:first-child { border-left: 1px solid ${tokens.cellBorder}; }
    .ad { font-size: 9px; margin-bottom: 2px; padding: 1px 4px; border-radius: 3px;
      overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .ad-border { border-left: 3px solid; }
    .ad-block { color: #fff; }
    .ad-line { border-bottom: 1px solid ${tokens.cellBorder}; border-radius: 0; }

    .tgrid { display: flex; }
    .hours { width: ${GUTTER}px; flex: none; position: relative; }
    .hours .hl { position: absolute; right: 6px; font-size: 9px; color: #888; transform: translateY(-6px); }
    .tcols {
      flex: 1; display: flex; position: relative;
      border-top: 1px solid ${tokens.cellBorder};
      background-image: repeating-linear-gradient(to bottom, ${tokens.line} 0, ${tokens.line} 1px, transparent 1px, transparent ${HOUR_H}px);
    }
    .tcol { flex: 1; position: relative; border-left: 1px solid ${tokens.cellBorder}; }
    .tcol:last-child { border-right: 1px solid ${tokens.cellBorder}; }
    .tcol.today { background: ${tokens.todayBg}; }

    .tev { position: absolute; border-radius: 4px; padding: 2px 4px; overflow: hidden; line-height: 1.2; }
    .tev-time { font-size: 8px; font-weight: 700; }
    .tev-title { font-size: 9px; }
    .tev-border { border-left: 3px solid; }
    .tev-block { color: #fff; }
    .tev-block .tev-time { opacity: 0.85; }
    .tev-line { border: 1px solid ${tokens.cellBorder}; background: #fff; }
    .tev-line .tev-time { color: #555; }

    table.month { width: 100%; border-collapse: collapse; table-layout: fixed; }
    table.month th { font-size: 10px; text-transform: uppercase; color: #555;
      padding: 6px 4px; border: 1px solid ${tokens.cellBorder}; background: ${tokens.headerBg}; }
    table.month td { border: 1px solid ${tokens.cellBorder}; vertical-align: top; height: 92px; padding: 4px; }
    table.month td.muted { background: #fafafa; color: #aaa; }
    table.month td.today { background: ${tokens.todayBg}; }
    .m-daynum { font-size: 11px; font-weight: 700; margin-bottom: 3px; }
    .m-ev { font-size: 9px; margin-bottom: 2px; padding: 1px 4px; border-radius: 3px;
      overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .m-border { border-left: 3px solid; }
    .m-block { color: #fff; }
    .m-line { border-bottom: 1px solid ${tokens.cellBorder}; border-radius: 0; }
    .m-more { font-size: 8px; color: #888; }

    @media print {
      body { padding: 0; }
      table.month td, table.month th { break-inside: avoid; }
    }
  `;

  return `<!DOCTYPE html>
<html lang="pl"><head><meta charset="utf-8" />
<title>${escapeHtml(opts.title)}</title>
<style>${css}</style></head>
<body>
  <h1>${escapeHtml(opts.title)}</h1>
  <div class="subtitle">Wydrukowano: ${escapeHtml(printedAt)}</div>
  ${content}
</body></html>`;
}

/** Prints the given HTML document via a hidden, self-cleaning iframe. */
export function printCalendar(html: string): void {
  if (typeof document === "undefined") return;
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.visibility = "hidden";

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
  };

  let printed = false;
  const doPrint = () => {
    if (printed) return;
    printed = true;
    const win = iframe.contentWindow;
    if (!win) {
      cleanup();
      return;
    }
    try {
      win.focus();
      win.print();
    } catch {
      cleanup();
      return;
    }
    win.addEventListener("afterprint", cleanup);
    // Safety net in case afterprint never fires (some browsers).
    setTimeout(cleanup, 60000);
  };

  iframe.onload = () => setTimeout(doPrint, 120);
  iframe.srcdoc = html;
  document.body.appendChild(iframe);
  // Fallback if onload doesn't fire for srcdoc in some environments.
  setTimeout(doPrint, 800);
}
