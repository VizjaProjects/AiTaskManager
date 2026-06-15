/**
 * Self-contained HTML document for the rich-text note editor.
 *
 * The same document is hosted inside an <iframe> on web/electron and inside a
 * react-native-webview on native, so the editing experience and the emitted
 * HTML are identical across every platform.
 *
 * Bridge protocol (postMessage, JSON):
 *  Host -> editor:  { type: "setContent", html }
 *                   { type: "command", command, value? }
 *                   { type: "focus" }
 *                   { type: "setTheme", isDark, backgroundColor }
 *  Editor -> host:  { type: "ready" }
 *                   { type: "change", html }
 *                   { type: "state", state: { bold, italic, ... } }
 *                   { type: "scheduleSelection", text }
 */

export interface EditorBridgeState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  insertUnorderedList: boolean;
  insertOrderedList: boolean;
}

const EDITOR_THEMES = {
  light: {
    "--editor-fg": "#1A1A1A",
    "--editor-muted": "#6B7280",
    "--editor-accent": "#4D41DF",
    "--editor-highlight": "#FDE68A",
    "--editor-code-bg": "rgba(0,0,0,0.06)",
    "--editor-line": "rgba(0,0,0,0.15)",
    "--editor-table-border": "rgba(0,0,0,0.25)",
    "--editor-selection": "rgba(77,65,223,0.24)",
    "--schedule-bg": "#1A1A1A",
    "--schedule-bg-hover": "#353535",
    "--schedule-fg": "#FFFFFF",
  },
  dark: {
    "--editor-fg": "#F4F4F5",
    "--editor-muted": "#C1C1C7",
    "--editor-accent": "#B8ADFF",
    "--editor-highlight": "#6B5B21",
    "--editor-code-bg": "rgba(255,255,255,0.08)",
    "--editor-line": "rgba(255,255,255,0.18)",
    "--editor-table-border": "rgba(255,255,255,0.28)",
    "--editor-selection": "rgba(184,173,255,0.34)",
    "--schedule-bg": "#F4F4F5",
    "--schedule-bg-hover": "#FFFFFF",
    "--schedule-fg": "#1A1A1A",
  },
} as const;

export function buildEditorHtml(options: {
  isDark: boolean;
  backgroundColor: string;
  placeholder?: string;
  enableScheduleSelection?: boolean;
  /** Base editor font size in px; scales the whole note for device readability. */
  fontSize?: number;
}): string {
  const {
    isDark,
    backgroundColor,
    placeholder = "Zacznij pisać…",
    enableScheduleSelection = false,
    fontSize = 17.5,
  } = options;
  const initialTheme = isDark ? EDITOR_THEMES.dark : EDITOR_THEMES.light;
  const initialThemeName = isDark ? "dark" : "light";

  return `<!DOCTYPE html>
<html lang="pl" data-theme="${initialThemeName}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  :root {
    --note-background: ${backgroundColor};
    ${Object.entries(initialTheme)
      .map(([name, value]) => `${name}: ${value};`)
      .join("\n    ")}
  }
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
  html, body { margin: 0; padding: 0; height: 100%; background: var(--note-background); }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
    color: var(--editor-fg);
    font-size: ${fontSize}px;
    line-height: 1.6;
  }
  ::selection { background: var(--editor-selection); }
  #editor {
    outline: none;
    padding: 20px 44px 120px 44px;
    min-height: 100%;
    caret-color: var(--editor-accent);
    -webkit-user-select: text;
    user-select: text;
  }
  #editor:empty:before {
    content: attr(data-placeholder);
    color: var(--editor-muted);
    pointer-events: none;
  }
  #editor h1 { font-size: 1.7em; font-weight: 700; margin: 0.4em 0 0.3em; }
  #editor h2 { font-size: 1.3em; font-weight: 700; margin: 0.4em 0 0.3em; }
  #editor p, #editor div { margin: 0 0 0.2em; }
  #editor ul, #editor ol { padding-left: 1.6em; margin: 0.3em 0; }
  #editor li { padding-left: 0.25em; }
  #editor blockquote {
    margin: 0.5em 0; padding: 0.2em 0 0.2em 0.9em;
    border-left: 3px solid var(--editor-accent); color: var(--editor-muted);
  }
  #editor pre {
    background: var(--editor-code-bg);
    border-radius: 8px; padding: 10px 12px; overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em;
  }
  #editor hr { border: none; border-top: 1px solid var(--editor-line); margin: 1em 0; }
  #editor a { color: var(--editor-accent); }
  #editor table { border-collapse: collapse; margin: 0.6em 0; width: max-content; max-width: 100%; }
  #editor td { border: 1px solid var(--editor-table-border); padding: 6px 8px; min-width: 48px; }
  #editor .highlight { background: var(--editor-highlight); border-radius: 3px; padding: 0 2px; }
  #editor .checklist-item { display: flex; align-items: flex-start; gap: 8px; margin: 0.15em 0; }
  #editor .checklist-item > input[type=checkbox] { margin-top: 0.35em; width: 16px; height: 16px; accent-color: var(--editor-accent); cursor: pointer; flex: none; }
  #editor .checklist-item > span { flex: 1; min-height: 1.55em; }
  #editor .checklist-item.done > span { text-decoration: line-through; color: var(--editor-muted); }
  #editor img { max-width: 100%; }
  html[data-theme="dark"] #editor [style*="color: rgb(0, 0, 0)"],
  html[data-theme="dark"] #editor [style*="color: rgb(26, 26, 26)"],
  html[data-theme="dark"] #editor [style*="color: #000000"],
  html[data-theme="dark"] #editor [style*="color: #000"],
  html[data-theme="dark"] #editor [style*="color: #1a1a1a"],
  html[data-theme="dark"] #editor [style*="color: black"],
  html[data-theme="dark"] #editor font[color="#000000"],
  html[data-theme="dark"] #editor font[color="#000"],
  html[data-theme="dark"] #editor font[color="#1a1a1a"],
  html[data-theme="dark"] #editor font[color="black"] {
    color: var(--editor-fg) !important;
  }
  #schedule-selection {
    display: none;
    position: fixed;
    z-index: 1000;
    border: 0;
    border-radius: 10px;
    padding: 8px 11px;
    background: var(--schedule-bg);
    color: var(--schedule-fg);
    box-shadow: 0 8px 24px rgba(0,0,0,0.22);
    font: 600 12px/1.2 -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif;
    white-space: nowrap;
    cursor: pointer;
  }
  #schedule-selection:hover { background: var(--schedule-bg-hover); }
  #slash-menu {
    display: none;
    position: fixed;
    z-index: 1100;
    min-width: 220px;
    max-height: 280px;
    overflow-y: auto;
    background: var(--note-background);
    border: 1px solid var(--editor-line);
    border-radius: 10px;
    padding: 6px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.18);
  }
  #slash-menu .slash-section {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--editor-muted);
    padding: 8px 10px 4px;
  }
  #slash-menu .slash-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border-radius: 6px;
    cursor: pointer;
    color: var(--editor-fg);
  }
  #slash-menu .slash-item .slash-glyph {
    width: 26px;
    height: 26px;
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--editor-line);
    border-radius: 6px;
    font-size: 13px;
    color: var(--editor-muted);
  }
  #slash-menu .slash-item .slash-label { font-size: 14px; }
  #slash-menu .slash-item.active { background: var(--editor-selection); }
  #slash-menu .slash-item.active .slash-glyph { color: var(--editor-fg); border-color: var(--editor-accent); }
</style>
</head>
<body>
<div id="editor" contenteditable="true" data-placeholder="${placeholder.replace(/"/g, "&quot;")}"></div>
${enableScheduleSelection ? '<button id="schedule-selection" type="button">Zaplanuj z AI</button>' : ""}
<div id="slash-menu" role="listbox"></div>
<script>
  (function () {
    var editor = document.getElementById("editor");
    var scheduleButton = document.getElementById("schedule-selection");
    var selectedText = "";
    var isNative = !!(window.ReactNativeWebView);
    var editorThemes = ${JSON.stringify(EDITOR_THEMES)};

    function applyTheme(isDark, backgroundColor) {
      var themeName = isDark ? "dark" : "light";
      var theme = editorThemes[themeName];
      var root = document.documentElement;
      root.setAttribute("data-theme", themeName);
      Object.keys(theme).forEach(function (name) {
        root.style.setProperty(name, theme[name]);
      });
      if (backgroundColor) {
        root.style.setProperty("--note-background", backgroundColor);
      }
    }

    function send(msg) {
      var s = JSON.stringify(msg);
      if (isNative && window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(s);
      } else if (window.parent && window.parent !== window) {
        window.parent.postMessage(s, "*");
      }
    }

    function emitChange() {
      send({ type: "change", html: editor.innerHTML });
    }

    function emitState() {
      try {
        send({
          type: "state",
          state: {
            bold: document.queryCommandState("bold"),
            italic: document.queryCommandState("italic"),
            underline: document.queryCommandState("underline"),
            strikeThrough: document.queryCommandState("strikeThrough"),
            insertUnorderedList: document.queryCommandState("insertUnorderedList"),
            insertOrderedList: document.queryCommandState("insertOrderedList")
          }
        });
      } catch (e) {}
    }

    function hideScheduleButton() {
      if (scheduleButton) scheduleButton.style.display = "none";
      selectedText = "";
    }

    function updateScheduleButton() {
      if (!scheduleButton) return;
      var selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        hideScheduleButton();
        return;
      }

      var range = selection.getRangeAt(0);
      var ancestor = range.commonAncestorContainer;
      var ancestorElement =
        ancestor.nodeType === 1 ? ancestor : ancestor.parentElement;
      if (!ancestorElement) {
        hideScheduleButton();
        return;
      }

      var selectionInsideEditor = editor.contains(ancestorElement);
      if (
        !selectionInsideEditor &&
        (!range.intersectsNode || !range.intersectsNode(editor))
      ) {
        hideScheduleButton();
        return;
      }

      var text = selectionInsideEditor
        ? selection.toString().trim()
        : editor.innerText.trim();
      if (!text) {
        hideScheduleButton();
        return;
      }

      selectedText = text;
      var rect = selectionInsideEditor
        ? range.getBoundingClientRect()
        : editor.getBoundingClientRect();
      scheduleButton.style.display = "block";

      requestAnimationFrame(function () {
        var buttonRect = scheduleButton.getBoundingClientRect();
        var left = rect.left + rect.width / 2 - buttonRect.width / 2;
        left = Math.max(8, Math.min(left, window.innerWidth - buttonRect.width - 8));
        var top = rect.top - buttonRect.height - 8;
        if (top < 8) top = rect.bottom + 8;
        top = Math.max(8, Math.min(top, window.innerHeight - buttonRect.height - 8));
        scheduleButton.style.left = left + "px";
        scheduleButton.style.top = top + "px";
      });
    }

    function setCss(on) {
      try { document.execCommand("styleWithCSS", false, on ? "true" : "false"); } catch (e) {}
    }

    function exec(command, value) {
      editor.focus();
      switch (command) {
        // Inline toggles: use semantic tags (styleWithCSS off) so that
        // toggling on/off is reliable and does not bleed into new typing.
        case "bold":
        case "italic":
        case "underline":
        case "strikeThrough":
        case "insertUnorderedList":
        case "insertOrderedList":
          setCss(false);
          document.execCommand(command, false, null);
          break;
        case "h1": setCss(false); document.execCommand("formatBlock", false, "H1"); break;
        case "h2": setCss(false); document.execCommand("formatBlock", false, "H2"); break;
        case "p": setCss(false); document.execCommand("formatBlock", false, "P"); break;
        case "blockquote": setCss(false); document.execCommand("formatBlock", false, "BLOCKQUOTE"); break;
        case "code": setCss(false); document.execCommand("formatBlock", false, "PRE"); break;
        case "hr": document.execCommand("insertHTML", false, "<hr/><p><br/></p>"); break;
        case "highlight": setCss(true); document.execCommand("hiliteColor", false, value || "#fef9c3"); break;
        case "foreColor": setCss(true); document.execCommand("foreColor", false, value || "#000000"); break;
        case "fontSize": document.execCommand("fontSize", false, value || "3"); break;
        case "createLink": if (value) document.execCommand("createLink", false, value); break;
        case "checklist": insertChecklist(); break;
        case "table": insertTable(value); break;
        case "justifyLeft":
        case "justifyCenter":
        case "justifyRight":
          setCss(true);
          document.execCommand(command, false, null);
          break;
        case "indent":
        case "outdent":
          setCss(true);
          document.execCommand(command, false, null);
          break;
        case "clear":
          setCss(false);
          document.execCommand("removeFormat", false, null);
          document.execCommand("formatBlock", false, "P");
          break;
        default: document.execCommand(command, false, value || null);
      }
      emitChange();
      emitState();
    }

    function makeChecklistItem(text) {
      var item = document.createElement("div");
      item.className = "checklist-item";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.setAttribute("contenteditable", "false");
      item.appendChild(cb);
      var span = document.createElement("span");
      if (text && text.length) span.textContent = text;
      item.appendChild(span);
      return item;
    }

    function placeCaretAtEnd(node) {
      var sel = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(node);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    // Keep a multi-line block selection highlighted after a formatting command
    // so the user can chain another action on the same lines.
    function selectAcrossNodes(firstNode, lastNode) {
      if (!firstNode || !lastNode) return;
      var sel = window.getSelection();
      var range = document.createRange();
      range.setStartBefore(firstNode);
      range.setEndAfter(lastNode);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    function insertChecklist() {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) { editor.focus(); }
      sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      var range = sel.getRangeAt(0);
      var hadSelection = !range.collapsed;

      // Toggle behaviour: if the selection already covers checklist items,
      // convert them back to plain paragraphs (remove the checkboxes).
      var existing = checklistItemsInRange(range);
      if (existing.length > 0) {
        var firstP = null;
        var lastP = null;
        for (var e = 0; e < existing.length; e++) {
          var done = existing[e];
          var doneSpan = done.querySelector("span");
          var p2 = document.createElement("p");
          var txt = doneSpan ? doneSpan.textContent : "";
          if (txt && txt.length) p2.textContent = txt;
          else p2.innerHTML = "<br/>";
          done.parentNode.replaceChild(p2, done);
          if (!firstP) firstP = p2;
          lastP = p2;
        }
        // Re-select the converted lines so the selection "sticks".
        if (existing.length > 1) selectAcrossNodes(firstP, lastP);
        else if (lastP) placeCaretAtEnd(lastP);
        return;
      }

      var lines;
      if (range.collapsed) {
        lines = [""];
      } else {
        // Use innerText of the cloned selection — it preserves line breaks
        // across block elements and <br>, unlike range.toString().
        var tmp = document.createElement("div");
        tmp.appendChild(range.cloneContents());
        tmp.setAttribute(
          "style",
          "position:fixed;left:-99999px;top:0;white-space:pre-wrap;"
        );
        document.body.appendChild(tmp);
        var text = tmp.innerText != null ? tmp.innerText : tmp.textContent;
        document.body.removeChild(tmp);
        // Block elements make innerText emit blank lines between paragraphs;
        // collapse those so each real line becomes exactly one checklist item.
        var raw = String(text).split(/\\n/);
        lines = [];
        for (var li = 0; li < raw.length; li++) {
          if (raw[li].trim() !== "") lines.push(raw[li]);
        }
        if (lines.length === 0) lines = [""];
      }

      var frag = document.createDocumentFragment();
      var first = null;
      var last = null;
      for (var i = 0; i < lines.length; i++) {
        last = makeChecklistItem(lines[i]);
        if (!first) first = last;
        frag.appendChild(last);
      }
      range.deleteContents();
      range.insertNode(frag);
      // Preserve a multi-line selection; collapse to caret for a single line.
      if (hadSelection && first && last && first !== last) {
        selectAcrossNodes(first, last);
      } else if (last) {
        placeCaretAtEnd(last.querySelector("span"));
      }
    }

    function insertTable(value) {
      var rows = 3, cols = 3;
      if (value && /^\\d+x\\d+$/i.test(value)) {
        var parts = value.toLowerCase().split("x");
        rows = Math.max(1, Math.min(20, parseInt(parts[0], 10) || 3));
        cols = Math.max(1, Math.min(20, parseInt(parts[1], 10) || 3));
      }
      var html = "<table><tbody>";
      for (var r = 0; r < rows; r++) {
        html += "<tr>";
        for (var c = 0; c < cols; c++) html += "<td><br/></td>";
        html += "</tr>";
      }
      html += "</tbody></table><p><br/></p>";
      document.execCommand("insertHTML", false, html);
    }

    function closestChecklistItem(node) {
      var el = node && node.nodeType === 1 ? node : (node ? node.parentElement : null);
      return el && el.closest ? el.closest(".checklist-item") : null;
    }

    // All checklist items touched by the given range (handles multi-line
    // selections as well as a collapsed caret sitting inside one item).
    function checklistItemsInRange(range) {
      var items = editor.querySelectorAll(".checklist-item");
      var result = [];
      for (var i = 0; i < items.length; i++) {
        var intersects = range.intersectsNode
          ? range.intersectsNode(items[i])
          : false;
        if (intersects) result.push(items[i]);
      }
      if (result.length === 0) {
        var caretItem = closestChecklistItem(range.startContainer);
        if (caretItem) result.push(caretItem);
      }
      return result;
    }

    editor.addEventListener("input", function () {
      emitChange();
      updateSlash();
    });
    editor.addEventListener("keyup", function (e) {
      emitState();
      updateScheduleButton();
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Enter" && e.key !== "Tab") {
        updateSlash();
      }
    });
    editor.addEventListener("mouseup", function () {
      emitState();
      updateScheduleButton();
      hideSlash();
    });
    editor.addEventListener("blur", function () {
      // Delay so a menu click (mousedown) can still resolve first.
      setTimeout(hideSlash, 120);
    });
    document.addEventListener("selectionchange", function () {
      emitState();
      updateScheduleButton();
    });
    window.addEventListener("scroll", hideScheduleButton, true);
    window.addEventListener("resize", hideScheduleButton);
    if (scheduleButton) {
      scheduleButton.addEventListener("mousedown", function (e) {
        e.preventDefault();
      });
      scheduleButton.addEventListener("click", function () {
        if (!selectedText) return;
        send({ type: "scheduleSelection", text: selectedText });
        hideScheduleButton();
      });
    }

    // Enter inside a checklist item continues the list (empty item exits it).
    editor.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" || e.shiftKey) return;
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      var item = closestChecklistItem(sel.anchorNode);
      if (!item) return;
      e.preventDefault();
      var span = item.querySelector("span");
      if (span && span.textContent.trim() === "") {
        var p = document.createElement("p");
        p.innerHTML = "<br/>";
        item.parentNode.insertBefore(p, item.nextSibling);
        item.parentNode.removeChild(item);
        placeCaretAtEnd(p);
      } else {
        var next = makeChecklistItem("");
        item.parentNode.insertBefore(next, item.nextSibling);
        placeCaretAtEnd(next.querySelector("span"));
      }
      emitChange();
      emitState();
    });

    // checklist toggling: gray out completed items and persist the state.
    // Clicking a checkbox inside a contenteditable host can place a caret
    // instead of toggling, so we mirror the live checked state on BOTH click
    // and change and keep the serialized checked attribute in sync each time.
    function syncCheckbox(cb) {
      if (!cb || !cb.matches || !cb.matches('input[type=checkbox]')) return;
      var item = cb.closest(".checklist-item");
      if (item) {
        if (cb.checked) {
          item.classList.add("done");
          cb.setAttribute("checked", "");
        } else {
          item.classList.remove("done");
          cb.removeAttribute("checked");
        }
      }
      emitChange();
    }
    editor.addEventListener("change", function (e) {
      syncCheckbox(e.target);
    });
    editor.addEventListener("click", function (e) {
      if (e.target && e.target.matches && e.target.matches('input[type=checkbox]')) {
        // .checked is already toggled by the browser when click fires.
        syncCheckbox(e.target);
      }
    });

    /* ---------- Notion-style "/" slash command menu ---------- */
    var slashMenu = document.getElementById("slash-menu");
    var slashItems = [
      { command: "h1", label: "Nagłówek 1", glyph: "H1" },
      { command: "h2", label: "Nagłówek 2", glyph: "H2" },
      { command: "p", label: "Tekst", glyph: "T" },
      { command: "insertUnorderedList", label: "Lista punktowana", glyph: "•" },
      { command: "insertOrderedList", label: "Lista numerowana", glyph: "1." },
      { command: "checklist", label: "Lista zadań", glyph: "☑" },
      { command: "blockquote", label: "Cytat", glyph: "\u201D" },
      { command: "code", label: "Kod", glyph: "<>" },
      { command: "hr", label: "Separator", glyph: "—" }
    ];
    var slashOpen = false;
    var slashNode = null;
    var slashStart = -1;
    var slashActiveIndex = 0;
    var slashFiltered = [];

    function hideSlash() {
      if (!slashMenu) return;
      slashOpen = false;
      slashNode = null;
      slashStart = -1;
      slashMenu.style.display = "none";
    }

    function caretTextInfo() {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return null;
      var range = sel.getRangeAt(0);
      if (!range.collapsed) return null;
      var node = range.startContainer;
      if (!node || node.nodeType !== 3) return null;
      if (!editor.contains(node)) return null;
      return { node: node, offset: range.startOffset };
    }

    function renderSlash(query) {
      var q = query.toLowerCase();
      slashFiltered = slashItems.filter(function (it) {
        return it.label.toLowerCase().indexOf(q) !== -1;
      });
      if (slashFiltered.length === 0) { hideSlash(); return; }
      if (slashActiveIndex >= slashFiltered.length) slashActiveIndex = 0;
      var html = '<div class="slash-section">Bloki</div>';
      for (var i = 0; i < slashFiltered.length; i++) {
        var it = slashFiltered[i];
        var cls = "slash-item" + (i === slashActiveIndex ? " active" : "");
        html += '<div class="' + cls + '" data-index="' + i + '">' +
          '<span class="slash-glyph">' + it.glyph + '</span>' +
          '<span class="slash-label">' + it.label + '</span></div>';
      }
      slashMenu.innerHTML = html;
      slashMenu.style.display = "block";
      slashOpen = true;
      positionSlash();
    }

    function positionSlash() {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      var rect = sel.getRangeAt(0).getBoundingClientRect();
      requestAnimationFrame(function () {
        var menuRect = slashMenu.getBoundingClientRect();
        var left = Math.max(8, Math.min(rect.left, window.innerWidth - menuRect.width - 8));
        var top = rect.bottom + 6;
        if (top + menuRect.height > window.innerHeight - 8) {
          top = rect.top - menuRect.height - 6;
        }
        if (top < 8) top = 8;
        slashMenu.style.left = left + "px";
        slashMenu.style.top = top + "px";
      });
    }

    function updateSlash() {
      var info = caretTextInfo();
      if (!info) { hideSlash(); return; }
      var text = info.node.textContent || "";
      var caret = info.offset;
      var slashPos = -1;
      for (var i = caret - 1; i >= 0; i--) {
        var ch = text.charAt(i);
        if (ch === "/") { slashPos = i; break; }
        if (ch === " " || ch === "\\u00A0" || ch === "\\n") break;
      }
      if (slashPos === -1) { hideSlash(); return; }
      if (slashPos > 0) {
        var prev = text.charAt(slashPos - 1);
        if (prev !== " " && prev !== "\\u00A0" && prev !== "\\n") { hideSlash(); return; }
      }
      var query = text.substring(slashPos + 1, caret);
      if (/\\s/.test(query)) { hideSlash(); return; }
      // Reset the highlight to the top each time the menu opens fresh.
      if (!slashOpen) slashActiveIndex = 0;
      slashNode = info.node;
      slashStart = slashPos;
      renderSlash(query);
    }

    function applySlash(index) {
      var it = slashFiltered[index];
      if (!it || !slashNode) { hideSlash(); return; }
      // Remove the "/query" text, then run the formatting command.
      var sel = window.getSelection();
      var caret = sel && sel.rangeCount ? sel.getRangeAt(0).startOffset : slashStart;
      try {
        var range = document.createRange();
        range.setStart(slashNode, slashStart);
        range.setEnd(slashNode, caret);
        range.deleteContents();
        var after = document.createRange();
        after.setStart(slashNode, slashStart);
        after.collapse(true);
        sel.removeAllRanges();
        sel.addRange(after);
      } catch (err) {}
      hideSlash();
      exec(it.command);
    }

    if (slashMenu) {
      slashMenu.addEventListener("mousedown", function (e) {
        var target = e.target && e.target.closest ? e.target.closest(".slash-item") : null;
        if (!target) return;
        e.preventDefault();
        applySlash(parseInt(target.getAttribute("data-index"), 10) || 0);
      });
    }

    function highlightSlashActive() {
      if (!slashMenu) return;
      var nodes = slashMenu.querySelectorAll(".slash-item");
      for (var i = 0; i < nodes.length; i++) {
        if (i === slashActiveIndex) {
          nodes[i].classList.add("active");
          // Keep the highlighted row visible when the list overflows.
          if (nodes[i].scrollIntoView) {
            nodes[i].scrollIntoView({ block: "nearest" });
          }
        } else {
          nodes[i].classList.remove("active");
        }
      }
    }

    // Capture phase so menu navigation wins over the checklist Enter handler.
    editor.addEventListener("keydown", function (e) {
      if (!slashOpen || slashFiltered.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        slashActiveIndex = (slashActiveIndex + 1) % slashFiltered.length;
        highlightSlashActive();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        slashActiveIndex = (slashActiveIndex - 1 + slashFiltered.length) % slashFiltered.length;
        highlightSlashActive();
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        applySlash(slashActiveIndex);
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        hideSlash();
      }
    }, true);

    window.addEventListener("scroll", function (e) {
      // Ignore the slash menu's OWN internal scrolling (triggered by
      // scrollIntoView during arrow navigation) — only outer scrolls dismiss.
      if (
        slashMenu &&
        e.target &&
        (e.target === slashMenu ||
          (e.target.nodeType === 1 && slashMenu.contains(e.target)))
      ) {
        return;
      }
      hideSlash();
    }, true);
    window.addEventListener("resize", hideSlash);

    function handleMessage(raw) {
      var msg;
      try { msg = JSON.parse(raw); } catch (e) { return; }
      if (!msg || !msg.type) return;
      if (msg.type === "setContent") {
        if (editor.innerHTML !== msg.html) {
          editor.innerHTML = msg.html || "";
        }
      } else if (msg.type === "command") {
        exec(msg.command, msg.value);
      } else if (msg.type === "focus") {
        editor.focus();
      } else if (msg.type === "setTheme") {
        applyTheme(!!msg.isDark, msg.backgroundColor);
      }
    }

    // native bridge
    document.addEventListener("message", function (e) { handleMessage(e.data); });
    window.addEventListener("message", function (e) { handleMessage(e.data); });

    send({ type: "ready" });
  })();
</script>
</body>
</html>`;
}
