import { View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";

type BrandKey =
  | "groq"
  | "openai"
  | "anthropic"
  | "google"
  | "azure"
  | "cohere"
  | "custom"
  | "unknown";

const SIZES = {
  sm: { box: 28, logo: 14 },
  md: { box: 36, logo: 18 },
  lg: { box: 44, logo: 22 },
};

function resolveBrand(provider: string | null): BrandKey {
  if (!provider) return "custom";
  const p = provider.toLowerCase().replace(/\s+/g, "");
  if (p.includes("groq")) return "groq";
  if (p.includes("openai") || p === "openai") return "openai";
  if (p.includes("anthropic")) return "anthropic";
  if (p.includes("google")) return "google";
  if (p.includes("azure")) return "azure";
  if (p.includes("cohere")) return "cohere";
  if (p.includes("custom")) return "custom";
  return "unknown";
}

function BrandLogo({ brand, size }: { brand: BrandKey; size: number }) {
  const s = size;

  switch (brand) {
    case "groq":
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            d="M13 2L4 14h6l-1 8 9-12h-6l1-8z"
            fill="#F55036"
          />
        </Svg>
      );
    case "openai":
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            fill="#FFFFFF"
            d="M22.28 9.82a5.98 5.98 0 00-.52-4.91 6.05 6.05 0 00-6.51-2.9A6.07 6.07 0 004.98 4.18a5.98 5.98 0 00-4 2.9 6.05 6.05 0 00.74 7.1 5.98 5.98 0 00.51 4.91 6.05 6.05 0 006.51 2.9A5.98 5.98 0 0013.26 24a6.06 6.06 0 005.77-4.21 5.99 5.99 0 004-2.9 6.06 6.06 0 00-.75-7.07zm-9.02 12.61a4.48 4.48 0 01-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 00.39-.68v-6.74l2.02 1.17a.07.07 0 01.04.05v5.58a4.5 4.5 0 01-4.49 4.49zm-9.66-4.13a4.47 4.47 0 01-.53-3.01l.14.09 4.78 2.76a.77.77 0 00.78 0l5.84-3.37v2.33a.08.08 0 01-.03.06L9.74 19.95a4.5 4.5 0 01-6.14-1.65zM2.34 7.9a4.49 4.49 0 012.37-1.97V11.6a.77.77 0 00.39.68l5.81 3.35-2.02 1.17a.08.08 0 01-.07 0L2.34 14.3a4.5 4.5 0 010-6.4zm16.6 3.86l-5.84-3.37 2.01-1.16a.08.08 0 01.07 0l4.83 2.79a4.49 4.49 0 01-.68 8.1v-5.68a.79.79 0 00-.39-.68zm2.01-3.02l-.14-.09-4.77-2.78a.78.78 0 00-.79 0L9.41 9.23V6.9a.07.07 0 01.03-.06l4.83-2.79a4.5 4.5 0 016.68 4.66zM8.31 12.86l-2.02-1.16a.08.08 0 01-.04-.06V6.07a4.5 4.5 0 017.38-3.45l-.14.08L8.7 5.46a.79.79 0 00-.39.68v6.72z"
          />
        </Svg>
      );
    case "anthropic":
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            d="M12 2.5L4.5 19.5h3.2l1.4-3.5h6.8l1.4 3.5h3.2L12 2.5zm-1.1 11.5l2.2-5.5 2.2 5.5H10.9z"
            fill="#D4A574"
          />
        </Svg>
      );
    case "google":
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M12 2l2.09 6.44H21l-5.45 3.96L17.64 19 12 14.9 6.36 19l1.91-6.6L3 8.44h6.91L12 2z" fill="#4285F4" />
        </Svg>
      );
    case "azure":
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M5.5 4.5L2 19.5h7.5l1-4.5 4.5 4.5L22 4.5H5.5z" fill="#0078D4" />
        </Svg>
      );
    case "cohere":
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Circle cx="6" cy="12" r="3" fill="#39594D" />
          <Circle cx="12" cy="12" r="3" fill="#39594D" />
          <Circle cx="18" cy="12" r="3" fill="#39594D" />
        </Svg>
      );
    case "custom":
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path
            d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
            stroke="#6B7280"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
            stroke="#6B7280"
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      );
    default:
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="8" stroke="#9CA3AF" strokeWidth={2} fill="none" />
          <Path d="M12 8v4M12 16h.01" stroke="#9CA3AF" strokeWidth={2} strokeLinecap="round" />
        </Svg>
      );
  }
}

const BRAND_BG: Record<BrandKey, string> = {
  groq: "#FFF7F5",
  openai: "#111111",
  anthropic: "#FFFBF5",
  google: "#F8FAFF",
  azure: "#F0F7FF",
  cohere: "#F5FAF7",
  custom: "#F9FAFB",
  unknown: "#F3F4F6",
};

interface ProviderBrandIconProps {
  provider: string | null;
  size?: "sm" | "md" | "lg";
}

export function ProviderBrandIcon({
  provider,
  size = "md",
}: ProviderBrandIconProps) {
  const brand = resolveBrand(provider);
  const dim = SIZES[size];
  const bg = brand === "openai" ? "#111111" : BRAND_BG[brand];

  return (
    <View
      className="rounded-md items-center justify-center"
      style={{
        width: dim.box,
        height: dim.box,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: "#E5E7EB",
      }}
    >
      <BrandLogo brand={brand} size={dim.logo} />
    </View>
  );
}

/** @deprecated use ProviderBrandIcon */
export function ProviderIcon({
  provider,
  size = "md",
}: {
  provider: string | null;
  size?: "sm" | "md" | "lg";
  variant?: "round" | "square";
}) {
  return <ProviderBrandIcon provider={provider} size={size} />;
}
