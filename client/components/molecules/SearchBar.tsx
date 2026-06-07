import { View, TextInput, TouchableOpacity, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as const) : undefined;

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Szukaj zadań...",
  onSubmit,
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-surface-container-lowest rounded-full px-4 py-2.5 border border-outline-variant">
      <MaterialIcons name="search" size={20} color="#9ca3af" />
      <TextInput
        className="flex-1 ml-2 text-sm font-body text-on-surface"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        style={[NO_OUTLINE, { borderWidth: 0 }]}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <MaterialIcons name="close" size={18} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );
}
