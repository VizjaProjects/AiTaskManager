import { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as const) : undefined;

interface OptionPickerProps {
  label: string;
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
}

export function OptionPicker({
  label,
  value,
  options,
  onChange,
  placeholder = "Select...",
  searchable = false,
  disabled = false,
  error,
}: OptionPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  return (
    <View className="w-full">
      <Text className="text-on-surface-variant font-label text-body-md mb-2">
        {label}
      </Text>
      <TouchableOpacity
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`flex-row items-center justify-between rounded-xl min-h-12 px-4 py-3 border border-outline-variant bg-surface-container-lowest ${
          error ? "border-error/40" : ""
        }`}
        style={{ opacity: disabled ? 0.5 : 1 }}
      >
        <Text
          className={`font-body text-base flex-1 ${
            selected ? "text-on-surface" : "text-on-surface-variant"
          }`}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>
        <MaterialIcons name="expand-more" size={22} color="#777587" />
      </TouchableOpacity>
      {error ? (
        <Text className="text-error font-body text-xs mt-1">{error}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-surface-container-lowest rounded-2xl w-full max-w-md max-h-[80%] overflow-hidden border border-outline-variant">
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-outline-variant">
              <Text className="text-on-surface font-headline text-title-lg">
                {label}
              </Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <MaterialIcons name="close" size={22} color="#777587" />
              </TouchableOpacity>
            </View>

            {searchable && (
              <View className="px-4 pt-4">
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Search..."
                  placeholderTextColor="#9ca3af"
                  className="rounded-xl h-11 px-4 border border-outline-variant bg-surface-container-low text-on-surface font-body text-sm"
                  style={NO_OUTLINE}
                />
              </View>
            )}

            <ScrollView className="max-h-96">
              {filtered.length === 0 ? (
                <View className="px-5 py-8 items-center">
                  <Text className="text-on-surface-variant font-body text-sm">
                    No options found
                  </Text>
                </View>
              ) : (
                filtered.map((option) => {
                  const active = option.value === value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        onChange(option.value);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`px-5 py-3.5 flex-row items-center justify-between border-b border-outline-variant/50 ${
                        active ? "bg-primary/5" : ""
                      }`}
                    >
                      <Text
                        className={`font-body text-sm flex-1 ${
                          active
                            ? "text-primary font-headline"
                            : "text-on-surface"
                        }`}
                        numberOfLines={2}
                      >
                        {option.label}
                      </Text>
                      {active ? (
                        <MaterialIcons name="check" size={18} color="#111111" />
                      ) : null}
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
