import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  variant?: "glass" | "surface" | "elevated";
}

export function Card({
  variant = "glass",
  className: cn,
  children,
  ...props
}: CardProps) {
  const base = "rounded-2xl";

  const variants = {
    glass: `${base} bg-white/70 p-6`,
    surface: `${base} bg-surface-container-lowest p-5`,
    elevated: `${base} bg-surface-container-lowest p-5 shadow-lg`,
  };

  return (
    <View className={`${variants[variant]} ${cn ?? ""}`} {...props}>
      {children}
    </View>
  );
}
