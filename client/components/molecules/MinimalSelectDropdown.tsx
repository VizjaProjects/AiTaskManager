import { useMemo, useState, type ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Platform,
  Pressable,
  type TextStyle,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { getUiTokens } from "@/lib/utils/uiTokens";
import { useThemeStore } from "@/lib/stores";

const NO_OUTLINE: TextStyle | undefined =
  Platform.OS === "web"
    ? ({ outlineStyle: "none" } as unknown as TextStyle)
    : undefined;

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface MinimalSelectDropdownProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  /** Keep the current value as the first row in the panel */
  pinSelected?: boolean;
}

function orderOptions(
  options: SelectOption[],
  value: string,
  pinSelected: boolean,
): SelectOption[] {
  if (!pinSelected || !value) return options;
  const selected = options.find((o) => o.value === value);
  if (!selected) return options;
  return [selected, ...options.filter((o) => o.value !== value)];
}

export function MinimalSelectDropdown({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  searchable = false,
  disabled = false,
  pinSelected = true,
}: MinimalSelectDropdownProps) {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const ui = getUiTokens(isDark);
  const inkColor = isDark ? "rgba(255,255,255,0.88)" : "#1a1a18";
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);

  const ordered = useMemo(
    () => orderOptions(options, value, pinSelected),
    [options, value, pinSelected],
  );

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return ordered;
    const q = query.trim().toLowerCase();
    return ordered.filter((o) => o.label.toLowerCase().includes(q));
  }, [ordered, query, searchable]);

  function handleSelect(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  return (
    <View className="gap-2.5">
      <Text
        className="font-label text-[10px] uppercase tracking-[0.14em]"
        style={{ color: ui.textMuted }}
      >
        {label}
      </Text>

      <TouchableOpacity
        disabled={disabled || options.length === 0}
        onPress={() => setOpen(true)}
        className="flex-row items-center gap-3 px-4 rounded-xl bg-surface-container-lowest border border-outline-variant"
        style={{
          minHeight: 44,
          opacity: disabled || options.length === 0 ? 0.5 : 1,
        }}
      >
        {selected?.icon ?? (
          <View
            className="rounded-full"
            style={{ width: 20, height: 20, backgroundColor: ui.divider }}
          />
        )}
        <Text
          className="flex-1 font-body text-sm"
          style={{ color: selected ? inkColor : ui.textMuted }}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <MaterialIcons name="expand-more" size={18} color={ui.textMuted} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1"
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
          onPress={() => {
            setOpen(false);
            setQuery("");
          }}
        >
          <View className="flex-1 items-center justify-center p-4">
            <Pressable
              onPress={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant"
              style={{
                maxHeight: "72%",
                ...ui.shadow,
              }}
            >
              <View className="flex-row items-center justify-between px-5 py-4">
                <Text className="text-on-surface font-headline text-title-lg">
                  {label}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  hitSlop={8}
                >
                  <MaterialIcons name="close" size={22} color={ui.textMuted} />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: ui.divider,
                  marginHorizontal: 20,
                }}
              />

              {searchable && (
                <View className="px-4 pt-4 pb-2">
                  <View
                    className="flex-row items-center px-4 rounded-full"
                    style={{
                      borderWidth: 1,
                      borderColor: ui.border,
                      height: 40,
                    }}
                  >
                    <MaterialIcons
                      name="search"
                      size={16}
                      color={ui.textMuted}
                    />
                    <TextInput
                      value={query}
                      onChangeText={setQuery}
                      placeholder="Search..."
                      placeholderTextColor={ui.textMuted}
                      className="flex-1 px-2 text-on-surface font-body text-sm"
                      style={[NO_OUTLINE, { borderWidth: 0 }]}
                      autoFocus={Platform.OS === "web"}
                    />
                  </View>
                </View>
              )}

              <ScrollView
                style={{ maxHeight: 320 }}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              >
                {filtered.length === 0 ? (
                  <View className="px-5 py-8 items-center">
                    <Text
                      className="font-body text-sm"
                      style={{ color: ui.textMuted }}
                    >
                      No options found
                    </Text>
                  </View>
                ) : (
                  filtered.map((option) => {
                    const active = option.value === value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => handleSelect(option.value)}
                        className="flex-row items-center gap-3 mx-2 my-0.5 px-3 py-3 rounded-lg"
                        style={
                          active
                            ? {
                                backgroundColor: ui.selectedBg,
                                borderWidth: 1,
                                borderColor: ui.selectedBorder,
                              }
                            : undefined
                        }
                      >
                        {option.icon ?? (
                          <View
                            className="rounded-full"
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: ui.divider,
                            }}
                          />
                        )}
                        <Text
                          className="flex-1 font-body text-sm"
                          style={{
                            color: active ? inkColor : ui.textSecondary,
                            fontFamily: active
                              ? "Inter_600SemiBold"
                              : undefined,
                          }}
                          numberOfLines={2}
                        >
                          {option.label}
                        </Text>
                        {active ? (
                          <MaterialIcons
                            name="check"
                            size={15}
                            color={ui.textSecondary}
                          />
                        ) : null}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
