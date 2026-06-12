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
  const { placeholder = "Zacznij pisać…" } = options;

  // The editor sits on top of the note's colour (applied by the host view),
  // and every note colour in the palette is a light pastel, so we always use
  // a transparent background with dark, readable text regardless of app theme.
  const bg = "transparent";
  const fg = "#1a1a1a";
  const muted = "#6b7280";
  const accent = "#4d41df";
  const highlight = "#fde68a";

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
    font-size: 17.5px;
    line-height: 1.6;
  }
  #editor {
    outline: none;
    padding: 20px 44px 120px 44px;
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
  #editor ul, #editor ol { padding-left: 1.6em; margin: 0.3em 0; }
  #editor li { padding-left: 0.25em; }
  #editor blockquote {
    margin: 0.5em 0; padding: 0.2em 0 0.2em 0.9em;
    border-left: 3px solid ${accent}; color: ${muted};
  }
  #editor pre {
    background: rgba(0,0,0,0.06);
    border-radius: 8px; padding: 10px 12px; overflow-x: auto;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.9em;
  }
  #editor hr { border: none; border-top: 1px solid rgba(0,0,0,0.15); margin: 1em 0; }
  #editor a { color: ${accent}; }
  #editor table { border-collapse: collapse; margin: 0.6em 0; width: max-content; max-width: 100%; }
  #editor td { border: 1px solid rgba(0,0,0,0.25); padding: 6px 8px; min-width: 48px; }
  #editor .highlight { background: ${highlight}; border-radius: 3px; padding: 0 2px; }
  #editor .checklist-item { display: flex; align-items: flex-start; gap: 8px; margin: 0.15em 0; }
  #editor .checklist-item > input[type=checkbox] { margin-top: 0.35em; width: 16px; height: 16px; accent-color: ${accent}; cursor: pointer; flex: none; }
  #editor .checklist-item > span { flex: 1; min-height: 1.55em; }
  #editor .checklist-item.done > span { text-decoration: line-through; color: ${muted}; }
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

    function insertChecklist() {
      var sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) { editor.focus(); }
      sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      var range = sel.getRangeAt(0);

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
      var last = null;
      for (var i = 0; i < lines.length; i++) {
        last = makeChecklistItem(lines[i]);
        frag.appendChild(last);
      }
      range.deleteContents();
      range.insertNode(frag);
      if (last) placeCaretAtEnd(last.querySelector("span"));
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

    editor.addEventListener("input", emitChange);
    editor.addEventListener("keyup", emitState);
    editor.addEventListener("mouseup", emitState);
    document.addEventListener("selectionchange", emitState);

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
    editor.addEventListener("change", function (e) {
      if (!e.target || !e.target.matches('input[type=checkbox]')) return;
      var item = e.target.closest(".checklist-item");
      if (item) {
        if (e.target.checked) {
          item.classList.add("done");
          e.target.setAttribute("checked", "");
        } else {
          item.classList.remove("done");
          e.target.removeAttribute("checked");
        }
      }
      emitChange();
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
