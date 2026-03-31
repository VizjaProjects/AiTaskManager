import { View, TextInput, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

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
    <View className="flex-row items-center bg-surface-container-low rounded-full px-4 py-2.5">
      <MaterialIcons name="search" size={20} color="#94a3b8" />
      <TextInput
        className="flex-1 ml-2 text-sm font-body text-on-surface"
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <MaterialIcons name="close" size={18} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>
  );
}
