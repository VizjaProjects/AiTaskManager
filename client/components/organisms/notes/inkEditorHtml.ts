/**
 * Self-contained HTML document for the handwritten ("ink") note editor.
 *
 * Sibling of editorHtml.ts and hosted exactly the same way — inside an <iframe>
 * on web/Electron and inside a react-native-webview on native — so stroke
 * capture, rendering and the stored document are identical everywhere.
 *
 * Canvases sit on the paper (#page), never as a full-screen layer (Safari
 * paints those black). Zoom is a CSS transform of #page.
 *   #bg/#committed/#live  visible-region tile at screen pixels (sharp zoom)
 *   #live hidden when idle; one polyline redraw per move (never incremental
 *   stroke — that fanned lines when coalesced samples replayed)
 *
 * Bridge protocol (postMessage, JSON):
 *  Host -> editor:  { type: "setDoc", doc }
 *                   { type: "setTool", tool, color, width }
 *                   { type: "setTemplate", template }
 *                   { type: "undo" } | { type: "redo" }
 *                   { type: "setTheme", isDark, backgroundColor }
 *                   { type: "requestThumbnail", width }
 *                   { type: "resetView" }
 *  Editor -> host:  { type: "ready" }
 *                   { type: "change", doc }
 *                   { type: "state", state: { canUndo, canRedo, strokes, template } }
 *                   { type: "thumbnail", dataUrl }
 */
import type { InkPageTemplate } from "@/lib/types";
import {
  INK_COORD_SCALE,
  INK_COORD_SCALE_FINE,
  INK_PAGE_A4,
  INK_PRESSURE_SCALE,
} from "@/lib/notes/inkDocument";

export interface InkBridgeState {
  canUndo: boolean;
  canRedo: boolean;
  strokes: number;
  template: InkPageTemplate;
  /** Current zoom relative to the fitted page; 1 means the whole page is visible. */
  zoom: number;
  /** Radians. 0 is upright. */
  rotation: number;
}

export const INK_THEMES = {
  light: {
    paper: "#fffdf9",
    rule: "rgba(0,0,0,0.13)",
    margin: "rgba(186,26,26,0.22)",
    darkInk: "#1a1a18",
  },
  dark: {
    paper: "#16161a",
    rule: "rgba(255,255,255,0.12)",
    margin: "rgba(255,255,255,0.16)",
    darkInk: "#f4f4f5",
  },
} as const;

/**
 * How long a finger is ignored after the stylus was last seen. This single
 * timeout is the whole of palm rejection: while writing, the hand resting on
 * the screen produces touch pointers that must not draw.
 */
const PEN_LOCKOUT_MS = 900;

/** Ramer-Douglas-Peucker tolerance in logical page px. */
const SIMPLIFY_EPSILON = 0.4;

export function buildInkEditorHtml(options: {
  isDark: boolean;
  backgroundColor?: string;
}): string {
  const { isDark, backgroundColor } = options;
  const initialThemeName = isDark ? "dark" : "light";
  const initialTheme = isDark ? INK_THEMES.dark : INK_THEMES.light;

  return `<!DOCTYPE html>
<html lang="pl" data-theme="${initialThemeName}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  :root {
    --ink-canvas-bg: ${backgroundColor || initialTheme.paper};
    --ink-paper: ${initialTheme.paper};
  }
  /* WebKit in dark color-scheme paints canvas clearRect as opaque black.
     The iframe must not inherit the host's dark scheme or the live layer
     covers every committed stroke and the sheet looks like a black void. */
  html { color-scheme: only light; }
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
  html, body {
    margin: 0; padding: 0; height: 100%; width: 100%;
    overflow: hidden;
    background: var(--ink-canvas-bg);
    touch-action: none;
    overscroll-behavior: none;
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
  }
  #stage {
    position: absolute; inset: 0;
    overflow: hidden;
    cursor: crosshair;
  }
  #stage[data-nav="pan"] { cursor: grab; }
  #stage[data-nav="gesture"] { cursor: grabbing; }
  #page {
    position: absolute; top: 0; left: 0;
    transform-origin: 0 0;
    background: var(--ink-paper);
    box-shadow: 0 2px 14px rgba(0,0,0,0.14);
    border-radius: 2px;
  }
  /* Counter-scale: the host is sized in screen CSS px and then scaled by
     1/viewScale so #page's zoom does not resample the bitmap. WebKit shifts
     a CSS-scaled canvas toward the bottom-right at high zoom. */
  #tile-host {
    position: absolute; top: 0; left: 0;
    transform-origin: 0 0;
    pointer-events: none;
  }
  #tile-host canvas {
    position: absolute; top: 0; left: 0;
    width: 100%; height: 100%;
    display: block;
    touch-action: none;
    background: transparent;
  }
  #live { visibility: hidden; }
  #live.active { visibility: visible; }
  #surface {
    position: absolute; inset: 0;
    touch-action: none;
  }
  #page.navigating {
    box-shadow: 0 18px 48px rgba(0,0,0,0.28);
    outline: 2px solid #5b4ee0;
    outline-offset: 3px;
  }
  #badge {
    position: absolute; left: 50%; bottom: 16px;
    transform: translateX(-50%);
    padding: 8px 14px;
    border-radius: 999px;
    background: rgba(26,26,24,0.88);
    color: #fffdf9;
    font: 500 12px/1.2 Inter, system-ui, sans-serif;
    letter-spacing: 0.01em;
    pointer-events: none;
    opacity: 0;
    transition: opacity 120ms ease;
    z-index: 4;
    white-space: nowrap;
  }
  #stage[data-nav] #badge { opacity: 1; }
</style>
</head>
<body>
<div id="stage">
  <div id="page">
    <div id="tile-host">
      <canvas id="bg"></canvas>
      <canvas id="committed"></canvas>
      <canvas id="live"></canvas>
    </div>
  </div>
  <div id="surface"></div>
  <div id="badge"></div>
</div>
<script>
  (function () {
    var COORD = ${INK_COORD_SCALE};
    var PACK_SCALE = ${INK_COORD_SCALE_FINE};
    var PRESSURE = ${INK_PRESSURE_SCALE};
    var PEN_LOCKOUT_MS = ${PEN_LOCKOUT_MS};
    var SIMPLIFY_EPSILON = ${SIMPLIFY_EPSILON};
    var PAGE_W = ${INK_PAGE_A4.w};
    var PAGE_H = ${INK_PAGE_A4.h};
    var themes = ${JSON.stringify(INK_THEMES)};

    var isNative = !!(window.ReactNativeWebView);
    var stage = document.getElementById("stage");
    var pageEl = document.getElementById("page");
    var tileHost = document.getElementById("tile-host");
    var surface = document.getElementById("surface");
    var bgCanvas = document.getElementById("bg");
    var committedCanvas = document.getElementById("committed");
    var liveCanvas = document.getElementById("live");

    var bgCtx = bgCanvas.getContext("2d", { alpha: true });
    var committedCtx = committedCanvas.getContext("2d", { alpha: true });
    var liveCtx = liveCanvas.getContext("2d", { alpha: true });
    var badge = document.getElementById("badge");

    var themeName = "${initialThemeName}";
    var doc = emptyDoc();
    var pageIndex = 0;

    /* Canvases live ON the paper as a visible-region tile — never a full-screen
       layer (Safari paints those black, especially with desynchronized) and
       never a full-A4 bitmap (that goes soft after CSS zoom). Backing store
       matches device pixels after scale(viewScale), so writing stays sharp. */
    var fitScale = 1;
    var viewScale = 1;
    var panX = 0;
    var panY = 0;
    var rotation = 0;
    /** Visible-region tile in page units + backing scale. */
    var tile = null;

    var tool = { kind: "pen", color: "#1a1a18", width: 2.4 };
    var undoStack = [];
    var redoStack = [];

    // Unpacked points + bounding box per stroke. A WeakMap keeps the cache out
    // of the object graph, so it never leaks into the serialized document.
    var strokeCache = new WeakMap();

    var lastPenAt = 0;
    var active = null;
    /** Non-null while two fingers are pinching or panning the page. */
    var gesture = null;

    /* ───────── document helpers ───────── */

    function emptyDoc() {
      return {
        pageSize: { w: PAGE_W, h: PAGE_H },
        pages: [{ id: "p0", template: "lines", strokes: [] }]
      };
    }

    function page() {
      if (!doc.pages.length) doc.pages.push({ id: "p0", template: "lines", strokes: [] });
      if (pageIndex >= doc.pages.length) pageIndex = doc.pages.length - 1;
      return doc.pages[pageIndex];
    }

    function packPoints(pts, scale) {
      var s = scale > 0 ? scale : COORD;
      var out = [];
      var px = 0, py = 0;
      for (var i = 0; i < pts.length; i++) {
        var qx = Math.round(pts[i].x * s);
        var qy = Math.round(pts[i].y * s);
        var pr = Math.round(pts[i].p * PRESSURE);
        if (pr < 0) pr = 0;
        if (pr > PRESSURE) pr = PRESSURE;
        out.push(qx - px, qy - py, pr);
        px = qx; py = qy;
      }
      return out;
    }

    function coordScaleOf(stroke) {
      return stroke.cs > 0 ? stroke.cs : COORD;
    }

    function strokeInfo(stroke) {
      var cached = strokeCache.get(stroke);
      if (cached) return cached;
      var pts = [];
      var x = 0, y = 0;
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      var d = stroke.d || [];
      var scale = coordScaleOf(stroke);
      for (var i = 0; i + 2 < d.length; i += 3) {
        x += d[i];
        y += d[i + 1];
        var lx = x / scale, ly = y / scale;
        pts.push({ x: lx, y: ly, p: d[i + 2] / PRESSURE });
        if (lx < minX) minX = lx;
        if (ly < minY) minY = ly;
        if (lx > maxX) maxX = lx;
        if (ly > maxY) maxY = ly;
      }
      var info = { pts: pts, minX: minX, minY: minY, maxX: maxX, maxY: maxY };
      strokeCache.set(stroke, info);
      return info;
    }

    /* ───────── geometry ───────── */

    function perpDistance(p, a, b) {
      var dx = b.x - a.x, dy = b.y - a.y;
      var len2 = dx * dx + dy * dy;
      if (len2 < 1e-9) {
        var ex = p.x - a.x, ey = p.y - a.y;
        return Math.sqrt(ex * ex + ey * ey);
      }
      var t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
      if (t < 0) t = 0;
      if (t > 1) t = 1;
      var cx = a.x + t * dx, cy = a.y + t * dy;
      var fx = p.x - cx, fy = p.y - cy;
      return Math.sqrt(fx * fx + fy * fy);
    }

    function segmentDistance(p, a, b) {
      return perpDistance(p, a, b);
    }

    function isShapeTool(kind) {
      return kind === "line" || kind === "rect" || kind === "ellipse" || kind === "arrow";
    }

    /**
     * Traces a geometric shape as one polyline from the drag's two corners.
     * Storing it as an ordinary point list is what lets the eraser, undo and
     * serialization stay completely unaware that shapes exist.
     */
    function shapePoints(kind, a, b) {
      var pts = [];
      function push(x, y) { pts.push({ x: x, y: y, p: 1 }); }

      if (kind === "rect") {
        push(a.x, a.y); push(b.x, a.y); push(b.x, b.y); push(a.x, b.y); push(a.x, a.y);
        return pts;
      }

      if (kind === "ellipse") {
        var cx = (a.x + b.x) / 2, cy = (a.y + b.y) / 2;
        var rx = Math.abs(b.x - a.x) / 2, ry = Math.abs(b.y - a.y) / 2;
        var steps = 64;
        for (var i = 0; i <= steps; i++) {
          var th = (i / steps) * Math.PI * 2;
          push(cx + Math.cos(th) * rx, cy + Math.sin(th) * ry);
        }
        return pts;
      }

      push(a.x, a.y); push(b.x, b.y);

      if (kind === "arrow") {
        var dx = b.x - a.x, dy = b.y - a.y;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len > 0.5) {
          var ux = dx / len, uy = dy / len;
          // Head grows with the shaft but stops, so long arrows stay in proportion.
          var head = Math.max(7, Math.min(len * 0.3, 32));
          var spread = 0.42;
          var cos = Math.cos(spread), sin = Math.sin(spread);
          // Barbs are traced back from the tip and returned to it, which keeps
          // the whole arrow a single continuous polyline.
          push(b.x - (ux * cos - uy * sin) * head, b.y - (uy * cos + ux * sin) * head);
          push(b.x, b.y);
          push(b.x - (ux * cos + uy * sin) * head, b.y - (uy * cos - ux * sin) * head);
        }
      }
      return pts;
    }

    /** Drops points the eye cannot tell apart; typically removes 60-70% of them. */
    function simplify(pts, eps) {
      var n = pts.length;
      if (n < 3) return pts;
      var keep = new Array(n);
      keep[0] = true;
      keep[n - 1] = true;
      var stack = [[0, n - 1]];
      while (stack.length) {
        var seg = stack.pop();
        var a = seg[0], b = seg[1];
        var maxD = -1, idx = -1;
        for (var i = a + 1; i < b; i++) {
          var d = perpDistance(pts[i], pts[a], pts[b]);
          if (d > maxD) { maxD = d; idx = i; }
        }
        if (maxD > eps && idx > 0) {
          keep[idx] = true;
          stack.push([a, idx]);
          stack.push([idx, b]);
        }
      }
      var out = [];
      for (var j = 0; j < n; j++) if (keep[j]) out.push(pts[j]);
      return out;
    }

    /** Three-point average; takes the tremor out without lagging the live stroke. */
    function smooth(pts) {
      if (pts.length < 3) return pts;
      var out = [pts[0]];
      for (var i = 1; i < pts.length - 1; i++) {
        out.push({
          x: (pts[i - 1].x + pts[i].x * 2 + pts[i + 1].x) / 4,
          y: (pts[i - 1].y + pts[i].y * 2 + pts[i + 1].y) / 4,
          p: (pts[i - 1].p + pts[i].p * 2 + pts[i + 1].p) / 4
        });
      }
      out.push(pts[pts.length - 1]);
      return out;
    }

    /**
     * Variable-width stroke as a closed outline, filled in one pass. Drawing
     * each segment separately would look the same but cost one draw call per
     * point, which does not survive a few hundred strokes on redraw.
     */
    function outline(pts, size, thinning) {
      var n = pts.length;
      var left = [], right = [];
      var minR = 0.6 / Math.max(viewScale, 0.01);
      var acc = [0];
      var total = 0;
      for (var k = 1; k < n; k++) {
        var adx = pts[k].x - pts[k - 1].x, ady = pts[k].y - pts[k - 1].y;
        total += Math.sqrt(adx * adx + ady * ady);
        acc.push(total);
      }
      var taper = total >= size * 4;
      var edge = 0.10;
      for (var i = 0; i < n; i++) {
        var prev = pts[i > 0 ? i - 1 : 0];
        var next = pts[i < n - 1 ? i + 1 : n - 1];
        var dx = next.x - prev.x, dy = next.y - prev.y;
        var len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1e-6) { dx = 1; dy = 0; len = 1; }
        dx /= len; dy /= len;
        var r = (size / 2) * (1 - thinning + thinning * pts[i].p);
        if (taper && total > 0) {
          var t = acc[i] / total;
          var env = 1;
          if (t < edge) env = 0.35 + 0.65 * (t / edge);
          else if (t > 1 - edge) env = 0.35 + 0.65 * ((1 - t) / edge);
          r *= env;
        }
        if (r < minR) r = minR;
        left.push({ x: pts[i].x - dy * r, y: pts[i].y + dx * r });
        right.push({ x: pts[i].x + dy * r, y: pts[i].y - dx * r });
      }
      right.reverse();
      return left.concat(right);
    }

    /** Quadratics through midpoints — gives smooth silhouettes and round caps for free. */
    function fillPolygon(ctx, poly) {
      var n = poly.length;
      if (n < 3) return;
      ctx.beginPath();
      ctx.moveTo((poly[n - 1].x + poly[0].x) / 2, (poly[n - 1].y + poly[0].y) / 2);
      for (var i = 0; i < n; i++) {
        var cur = poly[i];
        var next = poly[(i + 1) % n];
        ctx.quadraticCurveTo(cur.x, cur.y, (cur.x + next.x) / 2, (cur.y + next.y) / 2);
      }
      ctx.closePath();
      ctx.fill();
    }

    /* ───────── painting ───────── */

    function luminance(hex) {
      var c = String(hex || "").replace("#", "");
      if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
      if (c.length !== 6) return 0.5;
      var r = parseInt(c.slice(0, 2), 16) / 255;
      var g = parseInt(c.slice(2, 4), 16) / 255;
      var b = parseInt(c.slice(4, 6), 16) / 255;
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /** Near-black ink would vanish on a dark page, so it flips like the text editor's does. */
    function inkColor(color) {
      if (themeName === "dark" && luminance(color) < 0.26) return themes.dark.darkInk;
      if (themeName === "light" && luminance(color) > 0.9) return themes.light.darkInk;
      return color;
    }

    function paintPoints(ctx, pts, kind, color, width) {
      if (!pts.length) return;
      var isHighlighter = kind === "h";
      ctx.save();
      ctx.fillStyle = inkColor(color);
      if (isHighlighter) {
        ctx.globalCompositeOperation = "multiply";
        ctx.globalAlpha = 0.4;
      }
      if (kind === "s") {
        // Constant width, stroked rather than filled: a variable-width outline
        // pinches at a rectangle's corners because the normal there is the
        // average of two perpendicular directions.
        ctx.strokeStyle = inkColor(color);
        ctx.lineWidth = Math.max(0.6 / Math.max(viewScale, 0.01), width);
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (var si = 1; si < pts.length; si++) ctx.lineTo(pts[si].x, pts[si].y);
        ctx.stroke();
        ctx.restore();
        return;
      }
      if (pts.length === 1) {
        var r = Math.max(0.6 / Math.max(viewScale, 0.01), (width / 2) * (isHighlighter ? 1 : pts[0].p || 0.5));
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        fillPolygon(ctx, outline(pts, width, isHighlighter ? 0 : 0.55));
      }
      ctx.restore();
    }

    function paintStroke(ctx, stroke) {
      paintPoints(ctx, strokeInfo(stroke).pts, stroke.t, stroke.c, stroke.w);
    }

    function paintTemplate(ctx) {
      var template = page().template || "lines";
      var theme = themes[themeName];
      ctx.fillStyle = theme.paper;
      ctx.fillRect(0, 0, PAGE_W, PAGE_H);
      if (template === "blank") return;
      var hair = Math.max(0.35 / Math.max(viewScale, 0.01), 0.15);
      ctx.save();
      if (template === "lines") {
        ctx.strokeStyle = theme.rule;
        ctx.lineWidth = hair;
        for (var y = 64; y < PAGE_H - 20; y += 32) {
          ctx.beginPath();
          ctx.moveTo(40, y);
          ctx.lineTo(PAGE_W - 40, y);
          ctx.stroke();
        }
        ctx.strokeStyle = theme.margin;
        ctx.beginPath();
        ctx.moveTo(72, 32);
        ctx.lineTo(72, PAGE_H - 20);
        ctx.stroke();
      } else if (template === "grid") {
        ctx.strokeStyle = theme.rule;
        ctx.lineWidth = hair;
        for (var gx = 24; gx < PAGE_W; gx += 24) {
          ctx.beginPath();
          ctx.moveTo(gx, 0);
          ctx.lineTo(gx, PAGE_H);
          ctx.stroke();
        }
        for (var gy = 24; gy < PAGE_H; gy += 24) {
          ctx.beginPath();
          ctx.moveTo(0, gy);
          ctx.lineTo(PAGE_W, gy);
          ctx.stroke();
        }
      } else if (template === "dots") {
        ctx.fillStyle = theme.rule;
        var r = Math.max(0.35 / Math.max(viewScale, 0.01), 0.2);
        for (var dx2 = 24; dx2 < PAGE_W; dx2 += 24) {
          for (var dy2 = 24; dy2 < PAGE_H; dy2 += 24) {
            ctx.beginPath();
            ctx.arc(dx2, dy2, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.restore();
    }

    function applyTileTransform(ctx) {
      if (!tile) return;
      ctx.setTransform(tile.sx, 0, 0, tile.sy, -tile.x * tile.sx, -tile.y * tile.sy);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
    }

    function clearTileLayer(ctx, canvas) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      applyTileTransform(ctx);
    }

    function paintBackground() {
      if (!tile) return;
      applyTileTransform(bgCtx);
      paintTemplate(bgCtx);
    }

    function strokeIntersectsTile(stroke) {
      if (!tile) return true;
      var info = strokeInfo(stroke);
      if (info.maxX < tile.x || info.minX > tile.x + tile.w) return false;
      if (info.maxY < tile.y || info.minY > tile.y + tile.h) return false;
      return true;
    }

    function repaintCommitted() {
      if (!tile) return;
      clearTileLayer(committedCtx, committedCanvas);
      var strokes = page().strokes;
      for (var i = 0; i < strokes.length; i++) {
        if (strokeIntersectsTile(strokes[i])) paintStroke(committedCtx, strokes[i]);
      }
    }

    function clearLive() {
      if (tile) clearTileLayer(liveCtx, liveCanvas);
      liveCanvas.classList.remove("active");
    }

    function showLive() {
      liveCanvas.classList.add("active");
    }

    /* ───────── layout ───────── */

    function computeFitScale() {
      var availableW = stage.clientWidth;
      var availableH = stage.clientHeight;
      if (availableW <= 0 || availableH <= 0) return fitScale > 0 ? fitScale : 0.1;
      var pad = availableW < 620 ? 4 : 8;
      var scale = Math.min(
        (availableW - pad * 2) / PAGE_W,
        (availableH - pad * 2) / PAGE_H
      );
      return scale > 0 ? scale : 0.1;
    }

    function pageToScreen(px, py) {
      var c = Math.cos(rotation), s = Math.sin(rotation);
      var x = px * viewScale, y = py * viewScale;
      return { x: panX + x * c - y * s, y: panY + x * s + y * c };
    }

    function screenToPage(sx, sy) {
      var x = sx - panX, y = sy - panY;
      var c = Math.cos(-rotation), s = Math.sin(-rotation);
      return {
        x: (x * c - y * s) / viewScale,
        y: (x * s + y * c) / viewScale
      };
    }

    /**
     * Stage CSS px → page. Uses the matrix the browser actually applied
     * (Safari CSS scale can differ from the JS viewScale variable) so the nib
     * stays under the tip after a hard pinch.
     */
    function stageToPage(sx, sy) {
      try {
        var css = window.getComputedStyle(pageEl).transform;
        if (css && css !== "none" && typeof DOMMatrix !== "undefined") {
          var p = new DOMMatrix(css).inverse().transformPoint({ x: sx, y: sy });
          if (isFinite(p.x) && isFinite(p.y)) return { x: p.x, y: p.y };
        }
      } catch (e) {}
      return screenToPage(sx, sy);
    }

    /** Viewport client → stage CSS px. Host/iframe scale makes rect ≠ clientWidth. */
    function viewportToStage(clientX, clientY) {
      var rect = stage.getBoundingClientRect();
      var rw = rect.width || 1, rh = rect.height || 1;
      return {
        x: (clientX - rect.left) * (stage.clientWidth / rw),
        y: (clientY - rect.top) * (stage.clientHeight / rh)
      };
    }

    function eventStageXY(event) {
      return viewportToStage(event.clientX, event.clientY);
    }

    /** Keep at least a strip of paper on screen so it cannot be flung away. */
    function clampPan() {
      var stageW = stage.clientWidth;
      var stageH = stage.clientHeight;
      if (stageW <= 0 || stageH <= 0) return;
      var corners = [
        pageToScreen(0, 0),
        pageToScreen(PAGE_W, 0),
        pageToScreen(PAGE_W, PAGE_H),
        pageToScreen(0, PAGE_H)
      ];
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (var i = 0; i < 4; i++) {
        if (corners[i].x < minX) minX = corners[i].x;
        if (corners[i].y < minY) minY = corners[i].y;
        if (corners[i].x > maxX) maxX = corners[i].x;
        if (corners[i].y > maxY) maxY = corners[i].y;
      }
      var margin = 72;
      var dx = 0, dy = 0;
      if (maxX < margin) dx = margin - maxX;
      if (minX > stageW - margin) dx = stageW - margin - minX;
      if (maxY < margin) dy = margin - maxY;
      if (minY > stageH - margin) dy = stageH - margin - minY;
      panX += dx;
      panY += dy;
    }

    function applyPageChrome() {
      clampPan();
      pageEl.style.width = PAGE_W + "px";
      pageEl.style.height = PAGE_H + "px";
      pageEl.style.transform =
        "translate3d(" + panX + "px," + panY + "px,0) rotate(" + rotation + "rad) scale(" + viewScale + ")";
    }

    /** Viewport ∩ page, in page units, with a screen-pixel pad so a small pan
        does not immediately expose empty paper. */
    function visiblePageRect() {
      var sw = stage.clientWidth, sh = stage.clientHeight;
      if (sw <= 0 || sh <= 0) return { x: 0, y: 0, w: PAGE_W, h: PAGE_H };
      var pad = 96;
      var corners = [
        stageToPage(-pad, -pad),
        stageToPage(sw + pad, -pad),
        stageToPage(sw + pad, sh + pad),
        stageToPage(-pad, sh + pad)
      ];
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (var i = 0; i < 4; i++) {
        var p = corners[i];
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
      minX = Math.max(0, minX);
      minY = Math.max(0, minY);
      maxX = Math.min(PAGE_W, maxX);
      maxY = Math.min(PAGE_H, maxY);
      if (maxX <= minX || maxY <= minY) return { x: 0, y: 0, w: PAGE_W, h: PAGE_H };
      var x = Math.floor(minX);
      var y = Math.floor(minY);
      var w = Math.max(1, Math.ceil(maxX) - x);
      var h = Math.max(1, Math.ceil(maxY) - y);
      if (x + w > PAGE_W) w = PAGE_W - x;
      if (y + h > PAGE_H) h = PAGE_H - y;
      return { x: x, y: y, w: Math.max(1, w), h: Math.max(1, h) };
    }

    function pointInTile(p) {
      if (!tile || !p) return false;
      return p.x >= tile.x && p.x <= tile.x + tile.w &&
             p.y >= tile.y && p.y <= tile.y + tile.h;
    }

    /**
     * Size #bg/#committed/#live to the visible page AABB and give them a
     * backing store of viewScale * dpr pixels per page unit (1:1 with the
     * screen after CSS zoom). Capped at 4096 so Safari does not paint black.
     */
    function layoutTiles(force) {
      applyPageChrome();
      var vis = visiblePageRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var want = Math.max(viewScale * dpr, 1);
      var pixelW = Math.max(1, Math.round(vis.w * want));
      var pixelH = Math.max(1, Math.round(vis.h * want));
      var cap = 4096;
      if (pixelW > cap || pixelH > cap) {
        var r = Math.min(cap / pixelW, cap / pixelH);
        pixelW = Math.max(1, Math.floor(pixelW * r));
        pixelH = Math.max(1, Math.floor(pixelH * r));
      }
      var next = {
        x: vis.x, y: vis.y, w: vis.w, h: vis.h,
        sx: pixelW / vis.w, sy: pixelH / vis.h,
        pw: pixelW, ph: pixelH
      };
      if (!force && tile &&
          tile.x === next.x && tile.y === next.y &&
          tile.w === next.w && tile.h === next.h &&
          tile.pw === next.pw && tile.ph === next.ph) {
        return false;
      }
      tile = next;
      tileHost.style.left = tile.x + "px";
      tileHost.style.top = tile.y + "px";
      tileHost.style.width = (tile.w * viewScale) + "px";
      tileHost.style.height = (tile.h * viewScale) + "px";
      tileHost.style.transform = "scale(" + (1 / viewScale) + ")";
      var canvases = [bgCanvas, committedCanvas, liveCanvas];
      var contexts = [bgCtx, committedCtx, liveCtx];
      for (var i = 0; i < canvases.length; i++) {
        canvases[i].width = pixelW;
        canvases[i].height = pixelH;
        applyTileTransform(contexts[i]);
      }
      paintBackground();
      repaintCommitted();
      if (active && !active.erasing) replayLive();
      else clearLive();
      return true;
    }

    var viewReady = false;

    function resize() {
      if (stage.clientWidth <= 0 || stage.clientHeight <= 0) return;
      var previousFit = fitScale;
      fitScale = computeFitScale();
      if (!(previousFit > 0)) previousFit = fitScale;
      var zoomRatio = viewScale / previousFit;
      if (!(zoomRatio > 0)) zoomRatio = 1;
      viewScale = fitScale * zoomRatio;
      if (!viewReady) {
        centerPage();
        viewReady = true;
      }
      layoutTiles(true);
      emitState();
    }

    function centerPage() {
      panX = (stage.clientWidth - PAGE_W * viewScale) / 2;
      panY = (stage.clientHeight - PAGE_H * viewScale) / 2;
      applyPageChrome();
    }

    function resetView() {
      fitScale = computeFitScale();
      viewScale = fitScale;
      rotation = 0;
      centerPage();
      layoutTiles(true);
      emitState();
    }

    function toPagePoint(event) {
      var stageXY = eventStageXY(event);
      return stageToPage(stageXY.x, stageXY.y);
    }

    /** How far the view is zoomed in past the fitted page. 1 = whole page. */
    function zoomFactor() {
      var z = viewScale / Math.max(fitScale, 0.0001);
      return z > 1 ? z : 1;
    }

    /**
     * Pen size in page units. The nib stays the same size on screen when you
     * pinch in, so writing at 8× produces small letters on the page instead of
     * a fat marker the size of the zoomed stroke.
     */
    function nibWidth() {
      return Math.max(0.6 / Math.max(viewScale, 0.01), tool.width / zoomFactor());
    }

    function pressureOf(event) {
      if (event.pointerType === "pen") {
        // Some styluses report 0 while touching; treat that as a light default
        // rather than a zero-width stroke.
        return event.pressure > 0 ? event.pressure : 0.35;
      }
      return 0.55;
    }

    /* ───────── history ───────── */

    function pushUndo(op) {
      undoStack.push(op);
      if (undoStack.length > 120) undoStack.shift();
      redoStack.length = 0;
    }

    function applyRemove(entries) {
      var strokes = page().strokes;
      var sorted = entries.slice().sort(function (a, b) { return b.index - a.index; });
      for (var i = 0; i < sorted.length; i++) strokes.splice(sorted[i].index, 1);
    }

    function applyInsert(entries) {
      var strokes = page().strokes;
      var sorted = entries.slice().sort(function (a, b) { return a.index - b.index; });
      for (var i = 0; i < sorted.length; i++) {
        var at = Math.min(sorted[i].index, strokes.length);
        strokes.splice(at, 0, sorted[i].stroke);
      }
    }

    function undo() {
      var op = undoStack.pop();
      if (!op) return;
      if (op.type === "add") applyRemove(op.entries);
      else if (op.type === "remove") applyInsert(op.entries);
      else if (op.type === "template") {
        var current = page().template;
        page().template = op.previous;
        op.previous = current;
        paintBackground();
      }
      redoStack.push(op);
      repaintCommitted();
      emitChange();
    }

    function redo() {
      var op = redoStack.pop();
      if (!op) return;
      if (op.type === "add") applyInsert(op.entries);
      else if (op.type === "remove") applyRemove(op.entries);
      else if (op.type === "template") {
        var current2 = page().template;
        page().template = op.previous;
        op.previous = current2;
        paintBackground();
      }
      undoStack.push(op);
      repaintCommitted();
      emitChange();
    }

    /* ───────── drawing ───────── */

    function strokeSmoothPolyline(ctx, pts) {
      var n = pts.length;
      if (n < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      if (n === 2) {
        ctx.lineTo(pts[1].x, pts[1].y);
        ctx.stroke();
        return;
      }
      ctx.lineTo((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
      for (var i = 1; i < n - 1; i++) {
        ctx.quadraticCurveTo(
          pts[i].x,
          pts[i].y,
          (pts[i].x + pts[i + 1].x) / 2,
          (pts[i].y + pts[i + 1].y) / 2
        );
      }
      ctx.lineTo(pts[n - 1].x, pts[n - 1].y);
      ctx.stroke();
    }

    function paintLive() {
      if (!active || active.erasing) return;
      clearTileLayer(liveCtx, liveCanvas);
      showLive();
      var width = nibWidth();
      var highlighter = tool.kind === "highlighter";
      liveCtx.globalCompositeOperation = highlighter ? "multiply" : "source-over";
      liveCtx.globalAlpha = highlighter ? 0.4 : 1;
      liveCtx.strokeStyle = inkColor(tool.color);
      liveCtx.fillStyle = inkColor(tool.color);
      liveCtx.lineWidth = Math.max(0.6 / Math.max(viewScale, 0.01), width);
      liveCtx.lineCap = "round";
      liveCtx.lineJoin = "round";
      var pts = active.shape
        ? shapePoints(active.shape, active.origin, active.current)
        : active.points;
      if (!pts.length) return;
      if (pts.length === 1) {
        liveCtx.beginPath();
        liveCtx.arc(pts[0].x, pts[0].y, Math.max(0.3 / Math.max(viewScale, 0.01), width / 2), 0, Math.PI * 2);
        liveCtx.fill();
        return;
      }
      // Shapes keep sharp corners; handwriting goes through midpoints so
      // the live stroke already looks like the committed outline.
      if (active.shape) {
        liveCtx.beginPath();
        liveCtx.moveTo(pts[0].x, pts[0].y);
        for (var si = 1; si < pts.length; si++) liveCtx.lineTo(pts[si].x, pts[si].y);
        liveCtx.stroke();
        return;
      }
      strokeSmoothPolyline(liveCtx, pts);
    }

    function replayLive() {
      paintLive();
    }

    function beginStroke(event) {
      var point = toPagePoint(event);
      var erasing = tool.kind === "eraser";
      active = {
        pointerId: event.pointerId,
        pointerType: event.pointerType,
        erasing: erasing,
        shape: isShapeTool(tool.kind) ? tool.kind : null,
        origin: point,
        current: point,
        points: [{ x: point.x, y: point.y, p: pressureOf(event) }],
        removed: [],
        // Stroke order as it stood when the drag began. Erasing several strokes
        // in one drag shifts live indices, so undo restores against this.
        baseline: erasing ? page().strokes.slice() : null
      };
      if (erasing) {
        eraseAt(point);
        return;
      }
      if (!pointInTile(point)) layoutTiles(true);
      paintLive();
    }

    function extendStroke(event) {
      if (!active || active.pointerId !== event.pointerId) return;

      var samples = [];
      if (typeof event.getCoalescedEvents === "function") {
        try { samples = event.getCoalescedEvents() || []; } catch (e) { samples = []; }
      }
      if (!samples.length) samples = [event];

      var minPage = 0.35 / Math.max(viewScale, 0.01);
      var min2 = minPage * minPage;
      var far2 = (8 / Math.max(viewScale, 0.01));
      far2 = far2 * far2;
      var points = active.points;

      function dist2(a, b) {
        var dx = a.x - b.x, dy = a.y - b.y;
        return dx * dx + dy * dy;
      }

      function pushPoint(point, pressure) {
        var last = points[points.length - 1];
        if (dist2(point, last) < min2) return;
        points.push({ x: point.x, y: point.y, p: pressure });
      }

      // Coalesced buffers that replay from the origin look like a jump
      // back to points[0] while the tip is far away. Closing an "o" is
      // the opposite: the tip is already near the start.
      var start = 0;
      if (!active.erasing && !active.shape && points.length >= 3) {
        var origin = points[0];
        var tip = points[points.length - 1];
        while (start < samples.length) {
          var replay = toPagePoint(samples[start]);
          var toTip = dist2(replay, tip);
          var toOrigin = dist2(replay, origin);
          if (toOrigin < toTip && toTip > far2) {
            start += 1;
            continue;
          }
          break;
        }
      }

      var probe = null;
      for (var i = start; i < samples.length; i++) {
        var point = toPagePoint(samples[i]);
        probe = point;
        if (active.erasing) eraseAt(point);
        else if (active.shape) active.current = point;
        else pushPoint(point, pressureOf(samples[i]));
      }

      var tail = toPagePoint(event);
      probe = tail;
      if (active.erasing) eraseAt(tail);
      else if (active.shape) active.current = tail;
      else pushPoint(tail, pressureOf(event));

      if (active.erasing) return;
      if (probe && !pointInTile(probe)) {
        layoutTiles(true);
        return;
      }
      paintLive();
    }

    function endStroke() {
      if (!active) return;
      var finished = active;
      active = null;

      if (finished.erasing) {
        clearLive();
        if (finished.removed.length) {
          pushUndo({ type: "remove", entries: finished.removed });
          emitChange();
        } else {
          emitState();
        }
        return;
      }

      var pts;
      var width = nibWidth();
      if (finished.shape) {
        var span = Math.abs(finished.current.x - finished.origin.x) +
                   Math.abs(finished.current.y - finished.origin.y);
        if (span < 4 / zoomFactor()) { clearLive(); emitState(); return; }
        pts = shapePoints(finished.shape, finished.origin, finished.current);
      } else {
        if (finished.points.length === 0) { clearLive(); emitState(); return; }
        var cell = 0.5 / PACK_SCALE;
        var eps = Math.min(SIMPLIFY_EPSILON, 0.45 / viewScale);
        if (eps < cell) eps = cell;
        pts = simplify(smooth(finished.points), eps);
      }

      var stroke = {
        t: finished.shape ? "s" : (tool.kind === "highlighter" ? "h" : "p"),
        c: tool.color,
        w: Math.round(width * 100) / 100,
        cs: PACK_SCALE,
        d: packPoints(pts, PACK_SCALE)
      };
      var strokes = page().strokes;
      strokes.push(stroke);
      pushUndo({ type: "add", entries: [{ index: strokes.length - 1, stroke: stroke }] });
      applyTileTransform(committedCtx);
      paintStroke(committedCtx, stroke);
      clearLive();
      emitChange();
    }

    function eraseAt(point) {
      var radius = Math.max(6, tool.width * 3) / zoomFactor();
      var strokes = page().strokes;
      var hit = [];
      for (var i = strokes.length - 1; i >= 0; i--) {
        if (strokeHit(strokes[i], point, radius)) hit.push(i);
      }
      if (!hit.length) return;
      for (var j = 0; j < hit.length; j++) {
        var stroke = strokes[hit[j]];
        strokes.splice(hit[j], 1);
        active.removed.push({
          index: active.baseline ? active.baseline.indexOf(stroke) : hit[j],
          stroke: stroke
        });
      }
      repaintCommitted();
    }

    function strokeHit(stroke, point, radius) {
      var info = strokeInfo(stroke);
      var slack = radius + stroke.w;
      if (point.x < info.minX - slack || point.x > info.maxX + slack) return false;
      if (point.y < info.minY - slack || point.y > info.maxY + slack) return false;
      var pts = info.pts;
      var reach = radius + stroke.w / 2;
      if (pts.length === 1) {
        var dx = pts[0].x - point.x, dy = pts[0].y - point.y;
        return Math.sqrt(dx * dx + dy * dy) <= reach;
      }
      for (var i = 1; i < pts.length; i++) {
        if (segmentDistance(point, pts[i - 1], pts[i]) <= reach) return true;
      }
      return false;
    }

    /* ───────── input ───────── */

    var pan = null;

    function setNav(mode, label) {
      if (mode) {
        stage.setAttribute("data-nav", mode);
        pageEl.classList.add("navigating");
        badge.textContent = label || "";
      } else {
        stage.removeAttribute("data-nav");
        pageEl.classList.remove("navigating");
        badge.textContent = "";
      }
    }

    function cancelStroke() {
      if (!active) return;
      if (active.erasing) { endStroke(); return; }
      active = null;
      clearLive();
    }

    function shouldDraw(event) {
      if (gesture || pan) return false;
      if (event.pointerType === "pen") {
        lastPenAt = Date.now();
        return true;
      }
      if (event.pointerType === "mouse") return event.button === 0;
      // Finger never draws. One finger pans, two fingers pinch/rotate, the
      // stylus writes — that split is what makes the editor feel like a
      // notebook instead of a fight between the palm and the pen.
      return false;
    }

    function beginPan(event) {
      pan = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        panX: panX,
        panY: panY
      };
      try { surface.setPointerCapture(event.pointerId); } catch (e) {}
      setNav("pan", "Przesuwanie");
    }

    function movePan(event) {
      if (!pan || pan.pointerId !== event.pointerId) return;
      var dx = event.clientX - pan.startX;
      var dy = event.clientY - pan.startY;
      panX = pan.panX + dx;
      panY = pan.panY + dy;
      applyPageChrome();
    }

    function endPan(event) {
      if (!pan) return;
      if (event && pan.pointerId !== event.pointerId) return;
      if (event) {
        panX = pan.panX + (event.clientX - pan.startX);
        panY = pan.panY + (event.clientY - pan.startY);
      }
      pan = null;
      if (!gesture) setNav(null);
      layoutTiles(false);
      emitState();
    }

    surface.addEventListener("pointerdown", function (event) {
      if (gesture) return;
      if (shouldDraw(event)) {
        if (active) return;
        event.preventDefault();
        try { surface.setPointerCapture(event.pointerId); } catch (e) {}
        beginStroke(event);
        return;
      }
      if (event.pointerType === "touch") {
        // Palm of the writing hand: ignore while the pen is in use.
        if (active && active.pointerType === "pen") return;
        if (Date.now() - lastPenAt < PEN_LOCKOUT_MS) return;
        if (pan || gesture) return;
        event.preventDefault();
        beginPan(event);
      }
    });

    function onPointerMove(event) {
      if (pan) {
        event.preventDefault();
        movePan(event);
        return;
      }
      if (!active) {
        if (event.pointerType === "pen") lastPenAt = Date.now();
        return;
      }
      event.preventDefault();
      extendStroke(event);
    }

    surface.addEventListener("pointermove", onPointerMove);

    function finish(event) {
      if (pan && pan.pointerId === event.pointerId) {
        event.preventDefault();
        try { surface.releasePointerCapture(event.pointerId); } catch (e) {}
        endPan(event);
        return;
      }
      if (!active || active.pointerId !== event.pointerId) return;
      event.preventDefault();
      try { surface.releasePointerCapture(event.pointerId); } catch (e) {}
      endStroke();
    }

    surface.addEventListener("pointerup", finish);
    surface.addEventListener("pointercancel", finish);
    surface.addEventListener("pointerleave", function (event) {
      if (pan && pan.pointerId === event.pointerId) endPan(event);
      else if (active && active.pointerId === event.pointerId) endStroke();
    });

    ["gesturestart", "gesturechange", "gestureend"].forEach(function (name) {
      document.addEventListener(name, function (event) { event.preventDefault(); }, { passive: false });
    });
    document.addEventListener("contextmenu", function (event) { event.preventDefault(); });

    /* ───────── two-finger pinch, pan and rotate ───────── */

    function touchDistance(a, b) {
      var dx = a.clientX - b.clientX, dy = a.clientY - b.clientY;
      return Math.sqrt(dx * dx + dy * dy) || 1;
    }

    function touchAngle(a, b) {
      return Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX);
    }

    function touchMidpoint(a, b) {
      return viewportToStage(
        (a.clientX + b.clientX) / 2,
        (a.clientY + b.clientY) / 2
      );
    }

    function findTouch(list, id) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].identifier === id) return list[i];
      }
      return null;
    }

    function beginGesture(touches) {
      var mid = touchMidpoint(touches[0], touches[1]);
      var anchor = stageToPage(mid.x, mid.y);
      gesture = {
        idA: touches[0].identifier,
        idB: touches[1].identifier,
        startDistance: touchDistance(touches[0], touches[1]),
        startAngle: touchAngle(touches[0], touches[1]),
        startScale: viewScale,
        startRotation: rotation,
        anchorX: anchor.x,
        anchorY: anchor.y,
        midX: mid.x,
        midY: mid.y,
        lastMidX: mid.x,
        lastMidY: mid.y
      };
      setNav("gesture", "Powiększanie i obrót");
    }

    function updateGesture(event) {
      var a = findTouch(event.touches, gesture.idA);
      var b = findTouch(event.touches, gesture.idB);
      if (!a || !b) return;
      var mid = touchMidpoint(a, b);

      // No practical ceiling — the visible tile is re-rasterized on pinch end
      // at screen pixels, so writing after a zoom stays as sharp as fit view.
      var minimum = fitScale * 0.25;
      var next = gesture.startScale * (touchDistance(a, b) / gesture.startDistance);
      if (next < minimum) next = minimum;
      if (next > 1e5) next = 1e5;
      viewScale = next;
      rotation = gesture.startRotation + (touchAngle(a, b) - gesture.startAngle);

      var c = Math.cos(rotation), s = Math.sin(rotation);
      var ax = gesture.anchorX * viewScale;
      var ay = gesture.anchorY * viewScale;
      panX = mid.x - (ax * c - ay * s);
      panY = mid.y - (ax * s + ay * c);
      gesture.lastMidX = mid.x;
      gesture.lastMidY = mid.y;
      applyPageChrome();
    }

    function snapRotation() {
      var quarter = Math.PI / 2;
      var snapped = Math.round(rotation / quarter) * quarter;
      if (Math.abs(rotation - snapped) < (8 * Math.PI / 180)) rotation = snapped;
    }

    function endGesture() {
      if (!gesture) return;
      snapRotation();
      var c = Math.cos(rotation), s = Math.sin(rotation);
      var ax = gesture.anchorX * viewScale;
      var ay = gesture.anchorY * viewScale;
      panX = gesture.lastMidX - (ax * c - ay * s);
      panY = gesture.lastMidY - (ax * s + ay * c);
      gesture = null;
      setNav(null);
      // Re-tile the visible region at the new zoom so writing is not a
      // stretched bitmap. The tile stays at screen pixels (cap 4096).
      layoutTiles(true);
      emitState();
    }

    stage.addEventListener("touchstart", function (event) {
      if (event.touches.length < 2) return;
      event.preventDefault();
      if (pan) endPan(null);
      if (active && active.pointerType !== "pen") cancelStroke();
      if (active && active.pointerType === "pen") return;
      if (gesture) return;
      beginGesture(event.touches);
    }, { passive: false });

    stage.addEventListener("touchmove", function (event) {
      if (gesture) {
        event.preventDefault();
        updateGesture(event);
        return;
      }
      if (event.cancelable) event.preventDefault();
    }, { passive: false });

    function releaseTouch(event) {
      if (!gesture) return;
      var a = findTouch(event.touches, gesture.idA);
      var b = findTouch(event.touches, gesture.idB);
      if (!a || !b) endGesture();
    }

    stage.addEventListener("touchend", releaseTouch);
    stage.addEventListener("touchcancel", releaseTouch);

    /* ───────── bridge ───────── */

    function send(msg) {
      var s = JSON.stringify(msg);
      if (isNative && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(s);
      } else if (window.parent && window.parent !== window) {
        window.parent.postMessage(s, "*");
      }
    }

    function emitState() {
      send({
        type: "state",
        state: {
          canUndo: undoStack.length > 0,
          canRedo: redoStack.length > 0,
          strokes: page().strokes.length,
          template: page().template || "lines",
          zoom: fitScale > 0 ? viewScale / fitScale : 1,
          rotation: rotation
        }
      });
    }

    function emitChange() {
      // The whole document goes out on every committed stroke. Strokes end a
      // few times per second at most, and this keeps the host from ever
      // holding a stale copy when the note is closed.
      send({ type: "change", doc: doc });
      emitState();
    }

    function applyTheme(isDark, backgroundColor) {
      themeName = isDark ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", themeName);
      var root = document.documentElement;
      root.style.setProperty("--ink-paper", themes[themeName].paper);
      root.style.setProperty("--ink-canvas-bg", backgroundColor || themes[themeName].paper);
      paintBackground();
      repaintCommitted();
    }

    function sendThumbnail(width) {
      var target = width || 320;
      var scale = target / PAGE_W;
      var out = document.createElement("canvas");
      out.width = Math.round(PAGE_W * scale);
      out.height = Math.round(PAGE_H * scale);
      var ctx = out.getContext("2d");
      ctx.scale(scale, scale);
      var saved = viewScale;
      viewScale = 1;
      paintTemplate(ctx);
      viewScale = saved;
      var strokes = page().strokes;
      for (var i = 0; i < strokes.length; i++) paintStroke(ctx, strokes[i]);
      var dataUrl = "";
      try { dataUrl = out.toDataURL("image/webp", 0.7); } catch (e) { dataUrl = ""; }
      if (dataUrl.indexOf("data:image/webp") !== 0) {
        try { dataUrl = out.toDataURL("image/png"); } catch (e2) { dataUrl = ""; }
      }
      send({ type: "thumbnail", dataUrl: dataUrl });
    }

    function handleMessage(raw) {
      var msg;
      try { msg = JSON.parse(raw); } catch (e) { return; }
      if (!msg || !msg.type) return;

      if (msg.type === "setDoc") {
        doc = msg.doc && msg.doc.pages && msg.doc.pages.length ? msg.doc : emptyDoc();
        doc.pageSize = { w: PAGE_W, h: PAGE_H };
        pageIndex = 0;
        undoStack.length = 0;
        redoStack.length = 0;
        paintBackground();
        repaintCommitted();
        clearLive();
        emitState();
      } else if (msg.type === "setTool") {
        if (msg.tool) tool.kind = msg.tool;
        if (typeof msg.color === "string") tool.color = msg.color;
        if (typeof msg.width === "number") tool.width = msg.width;
        surface.style.cursor = tool.kind === "eraser" ? "cell" : "crosshair";
      } else if (msg.type === "setTemplate") {
        var previous = page().template;
        if (previous === msg.template) return;
        page().template = msg.template;
        pushUndo({ type: "template", previous: previous });
        paintBackground();
        emitChange();
      } else if (msg.type === "undo") {
        undo();
      } else if (msg.type === "redo") {
        redo();
      } else if (msg.type === "setTheme") {
        applyTheme(!!msg.isDark, msg.backgroundColor);
      } else if (msg.type === "requestThumbnail") {
        sendThumbnail(msg.width);
      } else if (msg.type === "resetView") {
        resetView();
      }
    }

    document.addEventListener("message", function (e) { handleMessage(e.data); });
    window.addEventListener("message", function (e) { handleMessage(e.data); });

    if (typeof ResizeObserver === "function") {
      new ResizeObserver(function () { resize(); }).observe(stage);
    }
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", function () { setTimeout(resize, 120); });

    resize();
    send({ type: "ready" });
  })();
</script>
</body>
</html>`;
}
