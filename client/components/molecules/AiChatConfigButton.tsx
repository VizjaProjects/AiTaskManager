import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { ProviderBrandIcon } from "../atoms/ProviderBrandIcon";
import { useLlmSettings } from "@/lib/hooks";
import { useLlmSettingsSelectionStore } from "@/lib/stores";
import {
  formatPickerLabel,
  isOrdovitaAiSelection,
  ORDOVITA_AI_ID,
} from "@/lib/utils/llmSettings";
import { UI } from "@/lib/utils/uiTokens";

interface AiChatConfigButtonProps {
  disabled?: boolean;
}

type AnchorRect = { x: number; y: number; width: number; height: number };

const PANEL_MIN_WIDTH = 280;
const PANEL_MAX_WIDTH = 320;
const GAP = 6;

function OrdovitaBrandIcon({ size = 28 }: { size?: number }) {
  return (
    <View
      className="rounded-lg items-center justify-center"
      style={{
        width: size,
        height: size,
        backgroundColor: "#1F2937",
        borderWidth: 1,
        borderColor: UI.border,
      }}
    >
      <MaterialIcons name="auto-awesome" size={size * 0.45} color="#F9FAFB" />
    </View>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <Text
      className="font-label text-[10px] uppercase tracking-[0.14em] px-3 pt-2 pb-1"
      style={{ color: UI.textMuted }}
    >
      {label}
    </Text>
  );
}

function DropdownItem({
  active,
  onSelect,
  icon,
  label,
}: {
  active: boolean;
  onSelect: () => void;
  icon: ReactNode;
  label: string;
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.7}
      className="flex-row items-center gap-3 mx-2 my-0.5 px-3 py-2.5 rounded-lg"
      style={
        active
          ? {
              backgroundColor: UI.selectedBg,
              borderWidth: 1,
              borderColor: UI.selectedBorder,
            }
          : undefined
      }
    >
      {icon}
      <Text
        className="flex-1 font-body text-[13px]"
        style={{
          color: active ? "#374151" : UI.textSecondary,
          fontFamily: active ? "Inter_600SemiBold" : undefined,
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
      {active ? (
        <MaterialIcons name="check" size={14} color={UI.textSecondary} />
      ) : null}
    </TouchableOpacity>
  );
}

const triggerStyle = {
  borderWidth: 1,
  borderColor: UI.borderHover,
};

export function AiChatConfigButton({
  disabled = false,
}: AiChatConfigButtonProps) {
  const router = useRouter();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);
  const { data: settings = [], isLoading } = useLlmSettings();
  const activeId = useLlmSettingsSelectionStore((s) => s.activeLlmSettingsId);
  const hydrated = useLlmSettingsSelectionStore((s) => s.hydrated);
  const hydrate = useLlmSettingsSelectionStore((s) => s.hydrate);
  const setActiveId = useLlmSettingsSelectionStore(
    (s) => s.setActiveLlmSettingsId,
  );

  useEffect(() => {
    if (!hydrated) void hydrate();
  }, [hydrated, hydrate]);

  useEffect(() => {
    if (!hydrated) return;
    if (isOrdovitaAiSelection(activeId)) return;
    const stillValid = settings.some((s) => s.llmSettingsId === activeId);
    if (!stillValid) setActiveId(ORDOVITA_AI_ID);
  }, [settings, activeId, hydrated, setActiveId]);

  const isOrdovita = isOrdovitaAiSelection(activeId);
  const active = settings.find((s) => s.llmSettingsId === activeId);

  function openDropdown() {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  }

  function select(id: string) {
    setActiveId(id);
    setOpen(false);
  }

  const isCompact = windowWidth < 480;

  const panelWidth = Math.min(
    PANEL_MAX_WIDTH,
    Math.max(
      PANEL_MIN_WIDTH,
      isCompact ? PANEL_MIN_WIDTH : (anchor?.width ?? PANEL_MIN_WIDTH),
    ),
  );

  const panelLeft = anchor
    ? Math.min(Math.max(8, anchor.x), windowWidth - panelWidth - 8)
    : 8;

  const openBelow = anchor
    ? anchor.y + anchor.height + GAP + 280 < windowHeight
    : true;

  const panelTop = anchor
    ? openBelow
      ? anchor.y + anchor.height + GAP
      : Math.max(8, anchor.y - GAP - 280)
    : 0;

  if (isLoading) {
    return (
      <View
        className="h-9 px-3 rounded-lg items-center justify-center bg-surface-container-lowest"
        style={triggerStyle}
      >
        <MaterialIcons name="memory" size={15} color={UI.textMuted} />
      </View>
    );
  }

  const dropdownPanel = (
    <View
      className="rounded-xl py-2 bg-surface-container-lowest border border-outline-variant"
      style={{
        width: panelWidth,
        ...UI.shadow,
      }}
    >
      <ScrollView
        style={{ maxHeight: 280 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        <SectionHeader label="System models" />
        <DropdownItem
          active={isOrdovita}
          onSelect={() => select(ORDOVITA_AI_ID)}
          icon={<OrdovitaBrandIcon />}
          label="OrdovitaAI"
        />

        {settings.length > 0 ? (
          <>
            <SectionHeader label="Your models" />
            {settings.map((item) => (
              <DropdownItem
                key={item.llmSettingsId}
                active={item.llmSettingsId === activeId}
                onSelect={() => select(item.llmSettingsId)}
                icon={<ProviderBrandIcon provider={item.provider} size="sm" />}
                label={formatPickerLabel(item)}
              />
            ))}
          </>
        ) : (
          <TouchableOpacity
            onPress={() => {
              setOpen(false);
              router.push("/(app)/profile?tab=ai");
            }}
            className="flex-row items-center gap-2 mx-3 mt-1 mb-2 px-3 py-2.5 rounded-lg bg-surface-container-low"
          >
            <MaterialIcons name="add" size={16} color={UI.textSecondary} />
            <Text
              className="font-body text-xs"
              style={{ color: UI.textSecondary }}
            >
              Add your own model
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          disabled={disabled}
          onPress={openDropdown}
          className={`h-9 rounded-lg flex-row items-center bg-surface-container-lowest ${
            isCompact ? "w-9 justify-center px-0" : "px-2.5 gap-2"
          }`}
          style={{
            ...triggerStyle,
            opacity: disabled ? 0.45 : 1,
            maxWidth: isCompact ? 36 : 220,
          }}
        >
          {isOrdovita ? (
            <OrdovitaBrandIcon size={isCompact ? 20 : 24} />
          ) : active ? (
            <ProviderBrandIcon provider={active.provider} size="sm" />
          ) : (
            <MaterialIcons name="memory" size={15} color={UI.textSecondary} />
          )}
          {!isCompact && (
            <>
              <Text
                className="font-body text-[13px] flex-shrink"
                style={{ color: "#374151" }}
                numberOfLines={1}
              >
                {isOrdovita
                  ? "OrdovitaAI"
                  : active
                    ? formatPickerLabel(active)
                    : "Select model"}
              </Text>
              <MaterialIcons
                name="expand-more"
                size={16}
                color={UI.textMuted}
              />
            </>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1"
          style={{ backgroundColor: "rgba(0,0,0,0.12)" }}
          onPress={() => setOpen(false)}
        >
          {anchor ? (
            <View
              style={{
                position: "absolute",
                top: panelTop,
                left: panelLeft,
              }}
              pointerEvents="box-none"
            >
              <Pressable onPress={(e) => e.stopPropagation()}>
                {dropdownPanel}
              </Pressable>
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}
