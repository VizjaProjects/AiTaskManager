import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { View } from "react-native";
import { buildEditorHtml } from "./editorHtml";
import type {
  RichTextEditorHandle,
  RichTextEditorProps,
} from "./RichTextEditor.types";

export const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(function RichTextEditor(
  {
    initialHtml,
    isDark,
    backgroundColor,
    placeholder,
    fontSize,
    onChange,
    onScheduleSelection,
    onStateChange,
  },
  ref,
) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const readyRef = useRef(false);
  const pendingHtmlRef = useRef(initialHtml);
  const initialThemeRef = useRef(isDark);
  const initialBackgroundRef = useRef(backgroundColor);
  const initialFontSizeRef = useRef(fontSize);

  const srcDoc = useMemo(
    () =>
      buildEditorHtml({
        isDark: initialThemeRef.current,
        backgroundColor: initialBackgroundRef.current,
        placeholder,
        enableScheduleSelection: true,
        fontSize: initialFontSizeRef.current,
      }),
    [placeholder],
  );

  function post(msg: Record<string, unknown>) {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify(msg), "*");
  }

  useImperativeHandle(ref, () => ({
    sendCommand: (cmd) => post({ type: "command", ...cmd }),
    setContent: (html) => {
      pendingHtmlRef.current = html;
      if (readyRef.current) post({ type: "setContent", html });
    },
    focus: () => post({ type: "focus" }),
  }));

  // Note switching is handled by remounting via `key`, so we intentionally do
  // NOT re-push initialHtml on change — doing so resets the DOM and the caret
  // jumps to the top while the user is typing (after a debounced save/refetch).

  useEffect(() => {
    if (readyRef.current) {
      post({ type: "setTheme", isDark, backgroundColor });
    }
  }, [backgroundColor, isDark]);

  useEffect(() => {
    function handle(e: MessageEvent) {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (typeof e.data !== "string") return;
      let msg: {
        type?: string;
        html?: string;
        text?: string;
        state?: never;
      };
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      if (msg.type === "ready") {
        readyRef.current = true;
        post({ type: "setContent", html: pendingHtmlRef.current });
        post({ type: "setTheme", isDark, backgroundColor });
      } else if (msg.type === "change" && typeof msg.html === "string") {
        onChange(msg.html);
      } else if (
        msg.type === "scheduleSelection" &&
        typeof msg.text === "string"
      ) {
        onScheduleSelection?.(msg.text);
      } else if (msg.type === "state" && msg.state) {
        onStateChange(msg.state);
      }
    }
    window.addEventListener("message", handle);
    return () => window.removeEventListener("message", handle);
  }, [backgroundColor, isDark, onChange, onScheduleSelection, onStateChange]);

  return (
    <View className="flex-1">
      <iframe
        ref={iframeRef as never}
        srcDoc={srcDoc}
        title="note-editor"
        style={{
          border: "none",
          width: "100%",
          height: "100%",
          background: "transparent",
        }}
      />
    </View>
  );
});
