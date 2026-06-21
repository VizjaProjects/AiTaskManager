import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import type { EditorBridgeState } from "./editorHtml";

export type EditorCommand =
  | { command: "bold" }
  | { command: "italic" }
  | { command: "underline" }
  | { command: "strikeThrough" }
  | { command: "insertUnorderedList" }
  | { command: "insertOrderedList" }
  | { command: "checklist" }
  | { command: "h1" }
  | { command: "h2" }
  | { command: "p" }
  | { command: "blockquote" }
  | { command: "code" }
  | { command: "hr" }
  | { command: "table"; value?: string }
  | { command: "clear" }
  | { command: "justifyLeft" }
  | { command: "justifyCenter" }
  | { command: "justifyRight" }
  | { command: "indent" }
  | { command: "outdent" }
  | { command: "highlight"; value: string }
  | { command: "foreColor"; value: string }
  | { command: "fontSize"; value: string }
  | { command: "createLink"; value: string };

const HIGHLIGHTS = ["#fef9c3", "#bbf7d0", "#bfdbfe", "#fbcfe8", "#fed7aa"];
const COLORS = [
  "#1a1a18",
  "#C0392B",
  "#B7770D",
  "#2E7D52",
  "#3b82f6",
  "#8b5cf6",
];

const TABLE_MAX = 6;

interface ToolbarProps {
  state: EditorBridgeState;
  isDark: boolean;
  onCommand: (cmd: EditorCommand) => void;
}

function ToolButton({
  icon,
  active,
  onPress,
  label,
}: {
  icon?: keyof typeof MaterialIcons.glyphMap;
  active?: boolean;
  onPress: () => void;
  label?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`h-9 min-w-9 px-2 items-center justify-center rounded-lg ${
        active ? "bg-primary-fixed" : ""
      }`}
      activeOpacity={0.7}
    >
      {icon ? (
        <MaterialIcons
          name={icon}
          size={20}
          color={active ? "#5b4ee0" : "#6b6965"}
        />
      ) : (
        <Text
          className={`font-headline text-sm ${active ? "text-accent" : "text-on-surface-variant"}`}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

export function NoteEditorToolbar({ state, isDark, onCommand }: ToolbarProps) {
  const [popover, setPopover] = useState<
    "format" | "highlight" | "color" | "table" | "align" | null
  >(null);
  const [tableHover, setTableHover] = useState<{ r: number; c: number }>({
    r: 0,
    c: 0,
  });

  function close() {
    setPopover(null);
  }

  return (
    <View className="border-t border-outline-variant bg-surface-container-lowest">
      {popover === "format" && (
        <View className="flex-row flex-wrap gap-1 px-3 py-2 border-b border-outline-variant/40">
          <ToolButton
            label="H1"
            onPress={() => {
              onCommand({ command: "h1" });
              close();
            }}
          />
          <ToolButton
            label="H2"
            onPress={() => {
              onCommand({ command: "h2" });
              close();
            }}
          />
          <ToolButton
            label="Body"
            onPress={() => {
              onCommand({ command: "p" });
              close();
            }}
          />
          <ToolButton
            icon="format-quote"
            onPress={() => {
              onCommand({ command: "blockquote" });
              close();
            }}
          />
          <ToolButton
            icon="code"
            onPress={() => {
              onCommand({ command: "code" });
              close();
            }}
          />
          <ToolButton
            icon="horizontal-rule"
            onPress={() => {
              onCommand({ command: "hr" });
              close();
            }}
          />
          <ToolButton icon="grid-on" onPress={() => setPopover("table")} />
          <ToolButton
            icon="format-clear"
            onPress={() => {
              onCommand({ command: "clear" });
              close();
            }}
          />
        </View>
      )}
      {popover === "highlight" && (
        <View className="flex-row gap-2 px-3 py-2 border-b border-outline-variant/40 items-center">
          {HIGHLIGHTS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => {
                onCommand({ command: "highlight", value: c });
                close();
              }}
              className="w-7 h-7 rounded-full border border-outline-variant"
              style={{ backgroundColor: c }}
            />
          ))}
        </View>
      )}
      {popover === "color" && (
        <View className="flex-row gap-2 px-3 py-2 border-b border-outline-variant/40 items-center">
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => {
                onCommand({ command: "foreColor", value: c });
                close();
              }}
              className="w-7 h-7 rounded-full border border-outline-variant"
              style={{ backgroundColor: c }}
            />
          ))}
        </View>
      )}

      {popover === "table" && (
        <View className="px-3 py-2 border-b border-outline-variant/40 gap-1.5">
          <Text className="text-on-surface-variant font-label text-xs">
            {tableHover.r > 0
              ? `${tableHover.r} \u00d7 ${tableHover.c}`
              : "Wybierz rozmiar tabeli"}
          </Text>
          <View className="gap-1">
            {Array.from({ length: TABLE_MAX }).map((_, r) => (
              <View key={r} className="flex-row gap-1">
                {Array.from({ length: TABLE_MAX }).map((__, c) => {
                  const on = r < tableHover.r && c < tableHover.c;
                  return (
                    <TouchableOpacity
                      key={c}
                      onPressIn={() => setTableHover({ r: r + 1, c: c + 1 })}
                      onPress={() => {
                        onCommand({
                          command: "table",
                          value: `${r + 1}x${c + 1}`,
                        });
                        setTableHover({ r: 0, c: 0 });
                        close();
                      }}
                      className={`w-5 h-5 rounded-sm border ${
                        on
                          ? "bg-primary border-primary"
                          : "border-outline-variant"
                      }`}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      )}

      {popover === "align" && (
        <View className="flex-row gap-1 px-3 py-2 border-b border-outline-variant/40 items-center">
          <ToolButton
            icon="format-align-left"
            onPress={() => {
              onCommand({ command: "justifyLeft" });
              close();
            }}
          />
          <ToolButton
            icon="format-align-center"
            onPress={() => {
              onCommand({ command: "justifyCenter" });
              close();
            }}
          />
          <ToolButton
            icon="format-align-right"
            onPress={() => {
              onCommand({ command: "justifyRight" });
              close();
            }}
          />
          <View className="w-px h-5 bg-outline-variant/50 mx-1" />
          <ToolButton
            icon="format-indent-decrease"
            onPress={() => {
              onCommand({ command: "outdent" });
              close();
            }}
          />
          <ToolButton
            icon="format-indent-increase"
            onPress={() => {
              onCommand({ command: "indent" });
              close();
            }}
          />
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingVertical: 6,
          gap: 2,
          alignItems: "center",
        }}
        keyboardShouldPersistTaps="always"
      >
        <ToolButton
          icon="add"
          onPress={() => setPopover(popover === "format" ? null : "format")}
          active={popover === "format"}
        />
        <ToolButton icon="title" onPress={() => onCommand({ command: "h2" })} />
        <View className="w-px h-5 bg-outline-variant/50 mx-1" />
        <ToolButton
          icon="format-bold"
          active={state.bold}
          onPress={() => onCommand({ command: "bold" })}
        />
        <ToolButton
          icon="format-italic"
          active={state.italic}
          onPress={() => onCommand({ command: "italic" })}
        />
        <ToolButton
          icon="format-underlined"
          active={state.underline}
          onPress={() => onCommand({ command: "underline" })}
        />
        <ToolButton
          icon="strikethrough-s"
          active={state.strikeThrough}
          onPress={() => onCommand({ command: "strikeThrough" })}
        />
        <View className="w-px h-5 bg-outline-variant/50 mx-1" />
        <ToolButton
          icon="format-list-bulleted"
          active={state.insertUnorderedList}
          onPress={() => onCommand({ command: "insertUnorderedList" })}
        />
        <ToolButton
          icon="format-list-numbered"
          active={state.insertOrderedList}
          onPress={() => onCommand({ command: "insertOrderedList" })}
        />
        <ToolButton
          icon="check-box"
          onPress={() => onCommand({ command: "checklist" })}
        />
        <ToolButton
          icon="format-align-left"
          active={popover === "align"}
          onPress={() => setPopover(popover === "align" ? null : "align")}
        />
        <View className="w-px h-5 bg-outline-variant/50 mx-1" />
        <ToolButton
          icon="format-color-fill"
          active={popover === "highlight"}
          onPress={() =>
            setPopover(popover === "highlight" ? null : "highlight")
          }
        />
        <ToolButton
          icon="format-color-text"
          active={popover === "color"}
          onPress={() => setPopover(popover === "color" ? null : "color")}
        />
      </ScrollView>
    </View>
  );
}
