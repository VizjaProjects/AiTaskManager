import {
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Platform,
  type TextInputProps,
} from "react-native";
import { useState, type Ref } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useThemeStore } from "@/lib/stores";
import { useT } from "@/lib/i18n";
import { getBrandTokens } from "@/lib/utils/uiTokens";

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineWidth: 0 } as const) : undefined;

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Positive confirmation under the field (brand tone), e.g. "Passwords match". */
  success?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  secureToggle?: boolean;
  /** Ref to the bordered field box (for measuring its position). */
  fieldRef?: Ref<View>;
  /** "brand" = landing/login look (brand-* tokens, 3:1 field border). */
  tone?: "app" | "brand";
}

export function Input({
  label,
  error,
  success,
  icon,
  secureToggle,
  fieldRef,
  secureTextEntry,
  tone = "app",
  style,
  ...props
}: InputProps) {
  const t = useT();
  const [hidden, setHidden] = useState(secureTextEntry ?? false);
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const isBrand = tone === "brand";
  const brand = getBrandTokens(isDark);
  const iconColor = isBrand ? brand.muted : "#9b9791";

  const labelClass = isBrand
    ? "text-brand-ink font-headline text-[15px] mb-2"
    : "text-on-surface-variant font-label text-body-md mb-2";
  const fieldClass = isBrand
    ? `flex-row items-center rounded-input min-h-12 pl-3.5 border bg-brand-surface ${
        error ? "border-brand-error" : success ? "border-brand-accent" : "border-brand-field"
      }`
    : `flex-row items-center rounded-md min-h-12 px-3.5 py-3 border border-outline-variant bg-surface ${
        error ? "border-[rgba(192,57,43,0.4)]" : ""
      }`;

  return (
    <View className="w-full">
      {label && <Text className={labelClass}>{label}</Text>}
      <View ref={fieldRef} className={fieldClass}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={iconColor}
            style={{ marginRight: 10 }}
          />
        )}
        <TextInput
          className={`flex-1 font-body text-body-lg ${isBrand ? "text-brand-ink py-3" : "text-on-surface"}`}
          placeholderTextColor={isBrand ? brand.field : "#9b9791"}
          secureTextEntry={hidden}
          // Passwords never go through autocorrect or spellcheck: once revealed,
          // browser spellcheck services could receive the plain text.
          {...(secureToggle || secureTextEntry
            ? { autoCorrect: false, spellCheck: false, autoCapitalize: "none" as const }
            : null)}
          aria-invalid={!!error}
          accessibilityLabel={props.accessibilityLabel ?? label}
          style={[NO_OUTLINE, { borderWidth: 0 }, style]}
          {...props}
        />
        {secureToggle && (
          <TouchableOpacity
            onPress={() => setHidden((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={
              hidden ? t("common.showPassword") : t("common.hidePassword")
            }
            className={isBrand ? "w-11 h-11 items-center justify-center" : "p-1"}
          >
            <MaterialIcons
              name={hidden ? "visibility" : "visibility-off"}
              size={20}
              color={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
      {isBrand ? (
        <View accessibilityLiveRegion="polite">
          {(error || success) && (
            <View className="flex-row items-center gap-1.5 mt-1.5">
              <MaterialIcons
                name={error ? "error-outline" : "check-circle"}
                size={16}
                color={error ? brand.error : brand.accentText}
              />
              <Text className={`flex-1 font-body text-sm ${error ? "text-brand-error" : "text-brand-accent-text"}`}>
                {error ?? success}
              </Text>
            </View>
          )}
        </View>
      ) : (
        error && <Text className="text-error font-body text-xs mt-1">{error}</Text>
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
      placeholderTextColor="#9b9791"
      {...props}
    />
  );
}
