import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";
import { buildInkEditorHtml } from "./inkEditorHtml";
import type { InkEditorHandle, InkEditorProps } from "./InkEditor.types";

export const InkEditor = forwardRef<InkEditorHandle, InkEditorProps>(
  function InkEditor(
    {
      initialDoc,
      isDark,
      backgroundColor,
      initialTool,
      onChange,
      onStateChange,
      onThumbnail,
    },
    ref,
  ) {
    const webRef = useRef<WebView | null>(null);
    const readyRef = useRef(false);
    const pendingDocRef = useRef(initialDoc);
    const toolRef = useRef(initialTool);
    const initialThemeRef = useRef(isDark);
    const initialBackgroundRef = useRef(backgroundColor);

    const html = useMemo(
      () =>
        buildInkEditorHtml({
          isDark: initialThemeRef.current,
          backgroundColor: initialBackgroundRef.current,
        }),
      [],
    );
    const source = useMemo(() => ({ html }), [html]);

    function post(msg: Record<string, unknown>) {
      const payload = JSON.stringify(msg).replace(/'/g, "\\'");
      webRef.current?.injectJavaScript(
        `(function(){document.dispatchEvent(new MessageEvent('message',{data:'${payload}'}));})();true;`,
      );
    }

    useImperativeHandle(ref, () => ({
      setTool: (setting) => {
        toolRef.current = setting;
        post({ type: "setTool", ...setting });
      },
      setDocument: (doc) => {
        pendingDocRef.current = doc;
        if (readyRef.current) post({ type: "setDoc", doc });
      },
      setTemplate: (template) => post({ type: "setTemplate", template }),
      undo: () => post({ type: "undo" }),
      redo: () => post({ type: "redo" }),
      requestThumbnail: (width) => post({ type: "requestThumbnail", width }),
      resetView: () => post({ type: "resetView" }),
    }));

    useEffect(() => {
      if (readyRef.current) post({ type: "setTheme", isDark, backgroundColor });
    }, [backgroundColor, isDark]);

    function handleMessage(e: WebViewMessageEvent) {
      let msg: { type?: string; doc?: never; state?: never; dataUrl?: string };
      try {
        msg = JSON.parse(e.nativeEvent.data);
      } catch {
        return;
      }
      if (msg.type === "ready") {
        readyRef.current = true;
        post({ type: "setDoc", doc: pendingDocRef.current });
        post({ type: "setTool", ...toolRef.current });
        post({ type: "setTheme", isDark, backgroundColor });
      } else if (msg.type === "change" && msg.doc) {
        onChange(msg.doc);
      } else if (msg.type === "state" && msg.state) {
        onStateChange(msg.state);
      } else if (msg.type === "thumbnail" && typeof msg.dataUrl === "string") {
        onThumbnail?.(msg.dataUrl);
      }
    }

    return (
      <View className="flex-1">
        <WebView
          ref={webRef}
          originWhitelist={["*"]}
          source={source}
          onMessage={handleMessage}
          // The canvas handles every gesture itself; WebView scrolling would
          // otherwise swallow the stylus drag.
          scrollEnabled={false}
          bounces={false}
          overScrollMode="never"
          style={{ flex: 1, backgroundColor: "transparent" }}
        />
      </View>
    );
  },
);
