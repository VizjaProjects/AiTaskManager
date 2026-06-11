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
 *  Editor -> host:  { type: "ready" }
 *                   { type: "change", html }
 *                   { type: "state", state: { bold, italic, ... } }
 */

export interface EditorBridgeState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  insertUnorderedList: boolean;
  insertOrderedList: boolean;
}

export function buildEditorHtml(options: {
  isDark: boolean;
  placeholder?: string;
}): string {
  const { isDark, placeholder = "Zacznij pisać…" } = options;

  const bg = isDark ? "#1a1a1a" : "#ffffff";
  const fg = isDark ? "#ededed" : "#1a1a1a";
  const muted = isDark ? "#7c7c83" : "#9ca3af";
  const accent = isDark ? "#9b8cff" : "#4d41df";
  const highlight = isDark ? "#5c5b2a" : "#fef9c3";

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<style>
  * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
  html, body { margin: 0; padding: 0; height: 100%; background: ${bg}; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
    color: ${fg};
    font-size: 16px;
    line-height: 1.55;
  }
  #editor {
    outline: none;
    padding: 18px 18px 120px 18px;
    min-height: 100%;
    caret-color: ${accent};
    -webkit-user-select: text;
    user-select: text;
  }
  #editor:empty:before {
    content: attr(data-placeholder);
    color: ${muted};
    pointer-events: none;
  }
  #editor h1 { font-size: 1.7em; font-weight: 700; margin: 0.4em 0 0.3em; }
  #editor h2 { font-size: 1.3em; font-weight: 700; margin: 0.4em 0 0.3em; }
  #editor p, #editor div { margin: 0 0 0.2em; }
  #editor ul, #editor ol { padding-left: 1.4em; margin: 0.3em 0; }
  #editor blockquote {
    margin: 0.5em 0; padding: 0.2em 0 0.2em 0.9em;
    border-left: 3px solid ${accent}; color: ${muted};
  }
  #editor pre {
    background: ${isDark ? "#0f0f0f" : "#f3f4f6"};
    border-radius: 8px; padding: 10px 12px; overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em;
  }
  #editor hr { border: none; border-top: 1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}; margin: 1em 0; }
  #editor a { color: ${accent}; }
  #editor table { border-collapse: collapse; margin: 0.6em 0; width: max-content; max-width: 100%; }
  #editor td { border: 1px solid ${isDark ? "#2a2a2a" : "#d1d5db"}; padding: 6px 8px; min-width: 48px; }
  #editor .highlight { background: ${highlight}; border-radius: 3px; padding: 0 2px; }
  #editor .checklist-item { display: flex; align-items: flex-start; gap: 8px; margin: 0.15em 0; }
  #editor .checklist-item > input[type=checkbox] { margin-top: 0.35em; width: 16px; height: 16px; accent-color: ${accent}; }
  #editor .checklist-item > span { flex: 1; }
  #editor img { max-width: 100%; }
</style>
</head>
<body>
<div id="editor" contenteditable="true" data-placeholder="${placeholder.replace(/"/g, "&quot;")}"></div>
<script>
  (function () {
    var editor = document.getElementById("editor");
    var isNative = !!(window.ReactNativeWebView);

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

    function exec(command, value) {
      editor.focus();
      try { document.execCommand("styleWithCSS", false, "true"); } catch (e) {}
      switch (command) {
        case "h1": document.execCommand("formatBlock", false, "H1"); break;
        case "h2": document.execCommand("formatBlock", false, "H2"); break;
        case "p": document.execCommand("formatBlock", false, "P"); break;
        case "blockquote": document.execCommand("formatBlock", false, "BLOCKQUOTE"); break;
        case "code": document.execCommand("formatBlock", false, "PRE"); break;
        case "hr": document.execCommand("insertHTML", false, "<hr/><p><br/></p>"); break;
        case "highlight": document.execCommand("hiliteColor", false, value || "#fef9c3"); break;
        case "foreColor": document.execCommand("foreColor", false, value || "#000000"); break;
        case "fontSize": document.execCommand("fontSize", false, value || "3"); break;
        case "createLink": if (value) document.execCommand("createLink", false, value); break;
        case "checklist": insertChecklist(); break;
        case "table": insertTable(); break;
        case "clear":
          document.execCommand("removeFormat", false, null);
          document.execCommand("formatBlock", false, "P");
          break;
        default: document.execCommand(command, false, value || null);
      }
      emitChange();
      emitState();
    }

    function insertChecklist() {
      var html = '<div class="checklist-item"><input type="checkbox"/><span>&nbsp;</span></div>';
      document.execCommand("insertHTML", false, html);
    }

    function insertTable() {
      var rows = 3, cols = 3, html = "<table><tbody>";
      for (var r = 0; r < rows; r++) {
        html += "<tr>";
        for (var c = 0; c < cols; c++) html += "<td><br/></td>";
        html += "</tr>";
      }
      html += "</tbody></table><p><br/></p>";
      document.execCommand("insertHTML", false, html);
    }

    editor.addEventListener("input", emitChange);
    editor.addEventListener("keyup", emitState);
    editor.addEventListener("mouseup", emitState);
    document.addEventListener("selectionchange", emitState);

    // checklist toggling
    editor.addEventListener("change", function (e) {
      if (e.target && e.target.matches('input[type=checkbox]')) emitChange();
    });

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
