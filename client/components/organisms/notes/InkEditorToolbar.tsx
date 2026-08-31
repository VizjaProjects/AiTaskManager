import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import {
  isInkShapeTool,
  type InkPageTemplate,
  type InkShapeTool,
  type InkTool,
} from "@/lib/types";
import {
  inkColorsForTool,
  inkSwatchBorder,
  inkWidthsForTool,
} from "@/lib/utils/inkColors";
import { useT } from "@/lib/i18n";

const TOOLS: {
  tool: InkTool;
  icon: keyof typeof MaterialIcons.glyphMap;
  labelKey: string;
}[] = [
  { tool: "pen", icon: "draw", labelKey: "ink.toolPen" },
  { tool: "highlighter", icon: "border-color", labelKey: "ink.toolHighlighter" },
  { tool: "eraser", icon: "cleaning-services", labelKey: "ink.toolEraser" },
];

const SHAPES: {
  tool: InkShapeTool;
  icon: keyof typeof MaterialIcons.glyphMap;
  labelKey: string;
}[] = [
  { tool: "line", icon: "show-chart", labelKey: "ink.shapeLine" },
  { tool: "arrow", icon: "arrow-outward", labelKey: "ink.shapeArrow" },
  { tool: "rect", icon: "crop-square", labelKey: "ink.shapeRect" },
  { tool: "ellipse", icon: "circle", labelKey: "ink.shapeEllipse" },
];

const TEMPLATES: {
  template: InkPageTemplate;
  icon: keyof typeof MaterialIcons.glyphMap;
  labelKey: string;
}[] = [
  { template: "lines", icon: "notes", labelKey: "ink.templateLines" },
  { template: "grid", icon: "grid-on", labelKey: "ink.templateGrid" },
  { template: "dots", icon: "blur-linear", labelKey: "ink.templateDots" },
  { template: "blank", icon: "crop-din", labelKey: "ink.templateBlank" },
];

interface InkEditorToolbarProps {
  tool: InkTool;
  color: string;
  width: number;
  template: InkPageTemplate;
  canUndo: boolean;
  canRedo: boolean;
  /** Zoom relative to the fitted page; the reset button appears when it drifts from 1. */
  zoom: number;
  rotation: number;
  isDark: boolean;
  onToolChange: (tool: InkTool) => void;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  onTemplateChange: (template: InkPageTemplate) => void;
  onUndo: () => void;
  onRedo: () => void;
  onResetView: () => void;
}

function ToolButton({
  icon,
  active,
  disabled,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  active?: boolean;
  disabled?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      className={`h-9 min-w-9 px-2 items-center justify-center rounded-lg ${
        active ? "bg-primary-fixed" : ""
      }`}
      style={{ opacity: disabled ? 0.35 : 1 }}
      activeOpacity={0.7}
    >
      <MaterialIcons
        name={icon}
        size={20}
        color={active ? "#5b4ee0" : "#6b6965"}
      />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View className="w-px h-6 mx-1 bg-outline-variant" />;
}

export function InkEditorToolbar({
  tool,
  color,
  width,
  template,
  canUndo,
  canRedo,
  zoom,
  rotation,
  isDark,
  onToolChange,
  onColorChange,
  onWidthChange,
  onTemplateChange,
  onUndo,
  onRedo,
  onResetView,
}: InkEditorToolbarProps) {
  const t = useT();
  const [templateOpen, setTemplateOpen] = useState(false);
  const [shapesOpen, setShapesOpen] = useState(false);
  const [lastShape, setLastShape] = useState<InkShapeTool>("line");

  const colors = inkColorsForTool(tool);
  const widths = inkWidthsForTool(tool);
  // The eraser has no colour of its own — its swatches would only mislead.
  const showColors = tool !== "eraser";
  const shapeActive = isInkShapeTool(tool);
  const activeShapeIcon =
    SHAPES.find((item) => item.tool === tool)?.icon ?? "category";
  // Below a whole pixel of difference the button would be offering to undo
  // something the user cannot see.
  const zoomed = Math.abs(zoom - 1) > 0.01 || Math.abs(rotation) > 0.02;

  return (
    <View className="border-t border-outline-variant bg-surface-container-lowest">
      <Text className="px-3 pt-1.5 font-label text-[11px] text-on-surface-variant">
        {t("ink.gestures")}
      </Text>
      {shapesOpen && (
        <View className="flex-row flex-wrap gap-1 px-3 py-2 border-b border-outline-variant/40">
          {SHAPES.map((item) => (
            <TouchableOpacity
              key={item.tool}
              onPress={() => {
                setLastShape(item.tool);
                onToolChange(item.tool);
                setShapesOpen(false);
              }}
              className={`flex-row items-center gap-1.5 px-2.5 h-9 rounded-lg ${
                tool === item.tool ? "bg-primary-fixed" : ""
              }`}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={item.icon}
                size={18}
                color={tool === item.tool ? "#5b4ee0" : "#6b6965"}
              />
              <Text
                className={`font-label text-xs ${
                  tool === item.tool
                    ? "text-accent"
                    : "text-on-surface-variant"
                }`}
              >
                {t(item.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {templateOpen && (
        <View className="flex-row flex-wrap gap-1 px-3 py-2 border-b border-outline-variant/40">
          {TEMPLATES.map((item) => (
            <TouchableOpacity
              key={item.template}
              onPress={() => {
                onTemplateChange(item.template);
                setTemplateOpen(false);
              }}
              className={`flex-row items-center gap-1.5 px-2.5 h-9 rounded-lg ${
                template === item.template ? "bg-primary-fixed" : ""
              }`}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={item.icon}
                size={18}
                color={template === item.template ? "#5b4ee0" : "#6b6965"}
              />
              <Text
                className={`font-label text-xs ${
                  template === item.template
                    ? "text-accent"
                    : "text-on-surface-variant"
                }`}
              >
                {t(item.labelKey)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 6,
          gap: 2,
        }}
      >
        <ToolButton
          icon="undo"
          disabled={!canUndo}
          onPress={onUndo}
          accessibilityLabel={t("ink.undo")}
        />
        <ToolButton
          icon="redo"
          disabled={!canRedo}
          onPress={onRedo}
          accessibilityLabel={t("ink.redo")}
        />

        <Divider />

        {TOOLS.map((item) => (
          <ToolButton
            key={item.tool}
            icon={item.icon}
            active={tool === item.tool}
            onPress={() => {
              setShapesOpen(false);
              onToolChange(item.tool);
            }}
            accessibilityLabel={t(item.labelKey)}
          />
        ))}

        <ToolButton
          icon={activeShapeIcon}
          active={shapeActive || shapesOpen}
          onPress={() => {
            // Coming from the pen, arm the shape used last so the button draws
            // immediately; the picker opens alongside for changing it.
            if (!shapeActive) onToolChange(lastShape);
            setShapesOpen((open) => !open);
          }}
          accessibilityLabel={t("ink.shapes")}
        />

        <Divider />

        {widths.map((value) => {
          const active = Math.abs(value - width) < 0.01;
          // Dot size tracks the nib so the presets read at a glance.
          const dot = Math.max(5, Math.min(18, 5 + value * 0.9));
          return (
            <TouchableOpacity
              key={value}
              onPress={() => onWidthChange(value)}
              accessibilityLabel={t("ink.width")}
              className={`h-9 w-9 items-center justify-center rounded-lg ${
                active ? "bg-primary-fixed" : ""
              }`}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: dot,
                  height: dot,
                  borderRadius: dot / 2,
                  backgroundColor: active ? "#5b4ee0" : "#6b6965",
                }}
              />
            </TouchableOpacity>
          );
        })}

        {showColors && (
          <>
            <Divider />
            {colors.map((value) => {
              const active = value.toLowerCase() === color.toLowerCase();
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => onColorChange(value)}
                  accessibilityLabel={t("ink.color")}
                  className="h-9 w-9 items-center justify-center rounded-lg"
                  activeOpacity={0.7}
                >
                  <View
                    style={{
                      width: active ? 22 : 18,
                      height: active ? 22 : 18,
                      borderRadius: 11,
                      backgroundColor: value,
                      borderWidth: active ? 2 : 1,
                      borderColor: active
                        ? isDark
                          ? "#f4f4f5"
                          : "#1a1a18"
                        : inkSwatchBorder(value, isDark),
                    }}
                  />
                </TouchableOpacity>
              );
            })}
          </>
        )}

        <Divider />

        <ToolButton
          icon="grid-4x4"
          active={templateOpen}
          onPress={() => {
            setShapesOpen(false);
            setTemplateOpen((open) => !open);
          }}
          accessibilityLabel={t("ink.template")}
        />

        {zoomed && (
          <ToolButton
            icon="fit-screen"
            onPress={onResetView}
            accessibilityLabel={t("ink.fitPage")}
          />
        )}
      </ScrollView>
    </View>
  );
}
