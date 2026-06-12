import { EditorCommand } from "./NoteEditorToolbar";

export interface RichTextEditorHandle {
  sendCommand: (cmd: EditorCommand) => void;
  setContent: (html: string) => void;
  focus: () => void;
}

export interface RichTextEditorProps {
  initialHtml: string;
  isDark: boolean;
  backgroundColor: string;
  placeholder?: string;
  onChange: (html: string) => void;
  onScheduleSelection?: (text: string) => void;
  onStateChange: (state: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikeThrough: boolean;
    insertUnorderedList: boolean;
    insertOrderedList: boolean;
  }) => void;
}
