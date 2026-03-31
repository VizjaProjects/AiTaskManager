import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { cssInterop } from "nativewind";

cssInterop(LinearGradient, { className: "style" });

type ButtonVariant = "primary" | "secondary" | "outline" | "text" | "error";

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  label: string;
  loading?: boolean;
  fullWidth?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: "",
  secondary: "bg-secondary rounded-xl px-6 py-3",
  outline: "border border-outline-variant rounded-xl px-6 py-3",
  text: "px-4 py-2",
  error: "bg-error rounded-xl px-6 py-3",
};

const TEXT_STYLES: Record<ButtonVariant, string> = {
  primary: "text-white font-headline text-sm",
  secondary: "text-white font-headline text-sm",
  outline: "text-on-surface font-headline text-sm",
  text: "text-primary font-headline text-sm",
  error: "text-on-error font-headline text-sm",
};

export function Button({
  variant = "primary",
  label,
  loading,
  fullWidth,
  disabled,
  ...props
}: ButtonProps) {
  const opacity = disabled || loading ? 0.5 : 1;

  if (variant === "primary") {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={disabled || loading}
        {...props}
      >
        <LinearGradient
          colors={["#4d41df", "#675df9"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className={`rounded-xl px-8 py-3.5 items-center justify-center ${fullWidth ? "w-full" : ""}`}
          style={{ opacity }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text className={TEXT_STYLES.primary}>{label}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled || loading}
      className={`items-center justify-center ${VARIANT_STYLES[variant]} ${fullWidth ? "w-full" : ""}`}
      style={{ opacity }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "text" ? "#4d41df" : "#ffffff"}
          size="small"
        />
      ) : (
        <Text className={TEXT_STYLES[variant]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
