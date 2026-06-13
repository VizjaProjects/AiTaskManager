import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Platform,
  type TextInputProps,
} from "react-native";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as const) : undefined;

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  secureToggle?: boolean;
}

export function Input({
  label,
  error,
  icon,
  secureToggle,
  secureTextEntry,
  style,
  ...props
}: InputProps) {
  const [hidden, setHidden] = useState(secureTextEntry ?? false);

  return (
    <View className="w-full">
      {label && (
        <Text className="text-on-surface-variant font-label text-body-md mb-2">
          {label}
        </Text>
      )}
      <View
        className={`flex-row items-center rounded-md min-h-12 px-3.5 py-3 border border-outline-variant bg-surface ${
          error ? "border-[rgba(192,57,43,0.4)]" : ""
        }`}
      >
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color="#9ca3af"
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          className="flex-1 text-on-surface font-body text-body-lg"
          placeholderTextColor="#9ca3af"
          secureTextEntry={hidden}
          style={[NO_OUTLINE, { borderWidth: 0 }, style]}
          {...props}
        />
        {secureToggle && (
          <TouchableOpacity
            onPress={() => setHidden((v) => !v)}
            className="p-1"
          >
            <MaterialIcons
              name={hidden ? "visibility" : "visibility-off"}
              size={20}
              color="#9ca3af"
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-error font-body text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}

export function PlainTextArea({
  value,
  onChangeText,
  placeholder,
  minHeight = 120,
  style,
  ...props
}: TextInputProps & { minHeight?: number }) {
  return (
    <TextInput
      className="bg-surface rounded-md p-4 text-on-surface font-body text-sm border border-outline-variant"
      style={[{ minHeight }, NO_OUTLINE, style]}
      multiline
      textAlignVertical="top"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}
