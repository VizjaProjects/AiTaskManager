import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { View } from "react-native";
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
    const iframeRef = useRef<HTMLIFrameElement | null>(null);
    const readyRef = useRef(false);
    const pendingDocRef = useRef(initialDoc);
    const toolRef = useRef(initialTool);
    const initialThemeRef = useRef(isDark);
    const initialBackgroundRef = useRef(backgroundColor);
    const onChangeRef = useRef(onChange);
    const onStateChangeRef = useRef(onStateChange);
    const onThumbnailRef = useRef(onThumbnail);
    onChangeRef.current = onChange;
    onStateChangeRef.current = onStateChange;
    onThumbnailRef.current = onThumbnail;

    // Theme is frozen at mount and pushed over the bridge afterwards, so the
    // iframe never reloads mid-stroke.
    const srcDoc = useMemo(
      () =>
        buildInkEditorHtml({
          isDark: initialThemeRef.current,
          backgroundColor: initialBackgroundRef.current,
        }),
      [],
    );

    function post(msg: Record<string, unknown>) {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify(msg), "*");
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

    useEffect(() => {
      function handle(e: MessageEvent) {
        if (e.source !== iframeRef.current?.contentWindow) return;
        if (typeof e.data !== "string") return;
        let msg: {
          type?: string;
          doc?: never;
          state?: never;
          dataUrl?: string;
        };
        try {
          msg = JSON.parse(e.data);
        } catch {
          return;
        }
        if (msg.type === "ready") {
          readyRef.current = true;
          post({ type: "setDoc", doc: pendingDocRef.current });
          post({ type: "setTool", ...toolRef.current });
          post({ type: "setTheme", isDark, backgroundColor });
        } else if (msg.type === "change" && msg.doc) {
          onChangeRef.current(msg.doc);
        } else if (msg.type === "state" && msg.state) {
          onStateChangeRef.current(msg.state);
        } else if (msg.type === "thumbnail" && typeof msg.dataUrl === "string") {
          onThumbnailRef.current?.(msg.dataUrl);
        }
      }
      window.addEventListener("message", handle);
      return () => window.removeEventListener("message", handle);
    }, [backgroundColor, isDark]);

    return (
      <View className="flex-1">
        <iframe
          ref={iframeRef as never}
          srcDoc={srcDoc}
          title="ink-editor"
          style={{
            border: "none",
            width: "100%",
            height: "100%",
            background: "transparent",
            display: "block",
          }}
        />
      </View>
    );
  },
);
