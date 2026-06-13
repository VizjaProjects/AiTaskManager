import { View, type ViewProps } from "react-native";

interface CardProps extends ViewProps {
  variant?: "glass" | "surface" | "elevated" | "ai-proposed" | "bordered";
  dashed?: boolean;
}

export function Card({
  variant = "surface",
  dashed,
  className: cn,
  children,
  style,
  ...props
}: CardProps) {
  const base = "rounded-md";

  const variants = {
    glass: `${base} bg-surface p-5 border border-outline-variant`,
    surface: `${base} bg-surface p-4 border border-outline-variant`,
    elevated: `${base} bg-surface p-4 border border-outline-variant`,
    bordered: `${base} bg-surface p-4 border border-outline-variant`,
    "ai-proposed": `${base} bg-surface p-4 border border-outline-variant`,
  };

  return (
    <View
      className={`${variants[variant]} ${dashed ? "border-dashed" : ""} ${cn ?? ""}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}
