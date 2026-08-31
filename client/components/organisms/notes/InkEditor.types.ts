import type { InkDocument, InkPageTemplate, InkTool } from "@/lib/types";
import type { InkBridgeState } from "./inkEditorHtml";

export interface InkToolSetting {
  tool: InkTool;
  color: string;
  width: number;
}

export interface InkEditorHandle {
  setTool: (setting: InkToolSetting) => void;
  setDocument: (doc: InkDocument) => void;
  setTemplate: (template: InkPageTemplate) => void;
  undo: () => void;
  redo: () => void;
  requestThumbnail: (width?: number) => void;
  /** Back to the whole page, centred. */
  resetView: () => void;
}

export interface InkEditorProps {
  initialDoc: InkDocument;
  isDark: boolean;
  /** Paper tint; falls back to the theme's default paper when omitted. */
  backgroundColor?: string;
  /** Tool to apply as soon as the canvas reports ready. */
  initialTool: InkToolSetting;
  onChange: (doc: InkDocument) => void;
  onStateChange: (state: InkBridgeState) => void;
  onThumbnail?: (dataUrl: string) => void;
}
