import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";
import { useThemeStore } from "@/lib/stores";
import { getBrandTokens } from "@/lib/utils/uiTokens";

type BrandButtonVariant = "primary" | "outline" | "surface" | "ink" | "ghost";
type BrandButtonSize = "sm" | "md" | "lg";

interface BrandButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: BrandButtonVariant;
  size?: BrandButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leading?: ReactNode;
}

const CONTAINER: Record<BrandButtonVariant, string> = {
  primary: "bg-brand-accent border-brand-accent",
  outline: "bg-transparent border-brand-field",
  surface: "bg-brand-surface border-brand-field",
  ink: "bg-brand-ink border-brand-ink",
  ghost: "bg-transparent border-transparent",
};

const LABEL: Record<BrandButtonVariant, string> = {
  primary: "text-brand-on-accent",
  outline: "text-brand-ink",
  surface: "text-brand-ink",
  ink: "text-brand-paper",
  ghost: "text-brand-ink",
};

const SIZE: Record<BrandButtonSize, { height: number; paddingX: number; text: string }> = {
  sm: { height: 44, paddingX: 14, text: "text-[15px]" },
  md: { height: 44, paddingX: 20, text: "text-[15px]" },
  lg: { height: 52, paddingX: 24, text: "text-base" },
};

/** Button for the landing page and login, built on the `brand-*` tokens. */
export function BrandButton({
  label,
  variant = "primary",
  size = "md",
  fullWidth,
  loading,
  disabled,
  leading,
  style,
  ...props
}: BrandButtonProps) {
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const brand = getBrandTokens(isDark);
  const s = SIZE[size];
  const spinnerColor =
    variant === "primary" ? brand.onAccent : variant === "ink" ? brand.paper : brand.ink;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.85}
      disabled={disabled || loading}
      className={`flex-row items-center justify-center gap-3 rounded-input border ${CONTAINER[variant]} ${fullWidth ? "w-full" : ""}`}
      style={[
        { minHeight: s.height, paddingHorizontal: s.paddingX, opacity: disabled || loading ? 0.6 : 1 },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} size="small" />
      ) : (
        <>
          {leading}
          <Text className={`font-headline ${s.text} ${LABEL[variant]}`}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
