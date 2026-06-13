import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "text"
  | "error"
  | "ai";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  label: string;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof MaterialIcons.glyphMap;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "bg-action rounded-md px-5 py-3 border border-action",
  secondary: "bg-surface rounded-md px-5 py-3 border border-outline-variant",
  outline: "bg-surface rounded-md px-5 py-3 border border-outline-variant",
  text: "px-4 py-2",
  error: "bg-surface rounded-md px-5 py-3 border border-[rgba(192,57,43,0.4)]",
  ai: "bg-surface rounded-md px-5 py-3 border border-outline-variant",
};

const TEXT_STYLES: Record<ButtonVariant, string> = {
  primary: "text-on-action font-headline text-sm",
  secondary: "text-on-surface font-headline text-sm",
  outline: "text-on-surface font-headline text-sm",
  text: "text-on-surface font-headline text-sm",
  error: "text-[#C0392B] font-headline text-sm",
  ai: "text-on-surface font-headline text-sm",
};

export function Button({
  variant = "primary",
  label,
  loading,
  fullWidth,
  disabled,
  icon,
  ...props
}: ButtonProps) {
  const opacity = disabled || loading ? 0.5 : 1;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center gap-2 ${VARIANT_STYLES[variant]} ${fullWidth ? "w-full" : ""}`}
      style={{ opacity }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary"
              ? "#f0f0f0"
              : variant === "error"
                ? "#C0392B"
                : "#6b6965"
          }
          size="small"
        />
      ) : (
        <>
          {variant === "ai" && (
            <MaterialIcons name="auto-awesome" size={16} color="#6b6965" />
          )}
          {icon && variant !== "ai" && (
            <MaterialIcons
              name={icon}
              size={18}
              color={
                variant === "primary"
                  ? "#f0f0f0"
                  : variant === "error"
                    ? "#C0392B"
                    : "#1a1a18"
              }
            />
          )}
          <Text className={TEXT_STYLES[variant]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
