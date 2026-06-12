import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import { View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { buildEditorHtml } from "./editorHtml";
import type {
  RichTextEditorHandle,
  RichTextEditorProps,
} from "./RichTextEditor.types";

export const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(function RichTextEditor(
  { initialHtml, isDark, placeholder, onChange, onStateChange },
  ref,
) {
  const webRef = useRef<WebView | null>(null);
  const readyRef = useRef(false);
  const pendingHtmlRef = useRef(initialHtml);

  const html = useMemo(
    () => buildEditorHtml({ isDark, placeholder }),
    [isDark, placeholder],
  );

  function post(msg: Record<string, unknown>) {
    const payload = JSON.stringify(msg).replace(/'/g, "\\'");
    webRef.current?.injectJavaScript(
      `(function(){document.dispatchEvent(new MessageEvent('message',{data:'${payload}'}));})();true;`,
    );
  }

  useImperativeHandle(ref, () => ({
    sendCommand: (cmd) => post({ type: "command", ...cmd }),
    setContent: (content) => {
      pendingHtmlRef.current = content;
      if (readyRef.current) post({ type: "setContent", html: content });
    },
    focus: () => post({ type: "focus" }),
  }));

  function handleMessage(e: WebViewMessageEvent) {
    let msg: { type?: string; html?: string; state?: never };
    try {
      msg = JSON.parse(e.nativeEvent.data);
    } catch {
      return;
    }
    if (msg.type === "ready") {
      readyRef.current = true;
      post({ type: "setContent", html: pendingHtmlRef.current });
    } else if (msg.type === "change" && typeof msg.html === "string") {
      onChange(msg.html);
    } else if (msg.type === "state" && msg.state) {
      onStateChange(msg.state);
    }
  }

  return (
    <View className="flex-1">
      <WebView
        ref={webRef}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        keyboardDisplayRequiresUserAction={false}
        hideKeyboardAccessoryView
        style={{ flex: 1, backgroundColor: "transparent" }}
      />
    </View>
  );
});
