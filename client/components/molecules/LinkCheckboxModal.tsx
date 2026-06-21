import { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { SearchBar } from "./SearchBar";

export type LinkCheckboxItem = {
  id: string;
  label: string;
  subtitle?: string;
  searchText?: string;
};

export type LinkCheckboxSection = {
  label: string;
  items: LinkCheckboxItem[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  emptyMessage?: string;
};

interface LinkCheckboxModalProps {
  visible: boolean;
  title: string;
  sections: LinkCheckboxSection[];
  searchPlaceholder?: string;
  onClose: () => void;
  onSave: () => void;
  saveLabel?: string;
  saving?: boolean;
}

function matchesQuery(item: LinkCheckboxItem, query: string) {
  const haystack = [
    item.label,
    item.subtitle ?? "",
    item.searchText ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function LinkCheckboxModal({
  visible,
  title,
  sections,
  searchPlaceholder = "Szukaj…",
  onClose,
  onSave,
  saveLabel = "Zapisz",
  saving = false,
}: LinkCheckboxModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!visible) setSearchQuery("");
  }, [visible]);

  const filteredSections = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sections;
    return sections.map((section) => ({
      ...section,
      items: section.items.filter((item) => matchesQuery(item, q)),
    }));
  }, [sections, searchQuery]);

  const totalVisible = filteredSections.reduce(
    (sum, s) => sum + s.items.length,
    0,
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40 items-center justify-center px-6"
        onPress={onClose}
      >
        <Pressable
          onPress={() => {}}
          className="w-full max-w-[480px] max-h-[80%] bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden"
        >
          <View className="flex-row items-center justify-between px-5 pt-4 pb-3 border-b border-outline-variant">
            <Text className="text-on-surface font-display text-lg">{title}</Text>
            <TouchableOpacity onPress={onClose} className="p-1">
              <MaterialIcons name="close" size={22} color="#9b9791" />
            </TouchableOpacity>
          </View>

          <View className="px-5 pt-3 pb-2">
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={searchPlaceholder}
            />
          </View>

          <ScrollView
            className="px-5"
            contentContainerStyle={{ paddingVertical: 8, gap: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {filteredSections.map((section) => (
              <View key={section.label} className="gap-2">
                <Text className="section-label">{section.label}</Text>
                {section.items.length === 0 ? (
                  <Text className="text-on-surface-variant font-body text-sm">
                    {searchQuery.trim()
                      ? "Brak wyników w tej sekcji."
                      : (section.emptyMessage ?? "Brak pozycji.")}
                  </Text>
                ) : (
                  section.items.map((item) => {
                    const checked = section.selectedIds.includes(item.id);
                    return (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => section.onToggle(item.id)}
                        className="flex-row items-center gap-3 py-2"
                      >
                        <MaterialIcons
                          name={
                            checked ? "check-box" : "check-box-outline-blank"
                          }
                          size={20}
                          color={checked ? "#5b4ee0" : "#9b9791"}
                        />
                        <View className="flex-1 min-w-0">
                          <Text
                            className="text-on-surface font-body text-sm"
                            numberOfLines={1}
                          >
                            {item.label}
                          </Text>
                          {item.subtitle ? (
                            <Text
                              className="text-on-surface-variant font-body text-xs"
                              numberOfLines={1}
                            >
                              {item.subtitle}
                            </Text>
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            ))}

            {searchQuery.trim() && totalVisible === 0 && (
              <Text className="text-on-surface-variant font-body text-sm text-center py-4">
                Brak wyników dla „{searchQuery.trim()}”.
              </Text>
            )}
          </ScrollView>

          <View className="flex-row items-center justify-end gap-2 px-5 py-3 border-t border-outline-variant">
            <TouchableOpacity onPress={onClose} className="px-4 py-2 rounded-md">
              <Text className="text-on-surface-variant font-label text-sm">
                Anuluj
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSave}
              disabled={saving}
              className="px-4 py-2 rounded-md bg-action"
              style={saving ? { opacity: 0.6 } : undefined}
            >
              <Text className="text-on-action font-headline text-sm">
                {saveLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
