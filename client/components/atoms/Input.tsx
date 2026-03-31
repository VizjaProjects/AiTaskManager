import { TextInput, View, Text, type TextInputProps } from "react-native";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

export function Input({ label, error, icon, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="w-full">
      {label && (
        <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center bg-surface-container-lowest rounded-xl h-12 px-4 ${
          focused ? "bg-surface-container-high" : ""
        } ${error ? "border border-error" : ""}`}
      >
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color="#777587"
            style={{ marginRight: 8 }}
          />
        )}
        <TextInput
          className="flex-1 text-on-surface font-body text-base"
          placeholderTextColor="#777587"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      </View>
      {error && (
        <Text className="text-error font-body text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}
