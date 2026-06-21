import { useState } from "react";
import { View, Text, TouchableOpacity, Pressable } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useUserPlan } from "@/lib/hooks";
import { PlanUsageBar } from "./PlanUsageBar";
import { getUiTokens } from "@/lib/utils/uiTokens";
import { useThemeStore } from "@/lib/stores";

/**
 * A subtle info affordance for the AI composer. Tapping it reveals a small
 * popover with the user's remaining AI calls for the day, so they know how many
 * requests are left before generating. Arena tokens + MaterialIcons only.
 */
export function AiLimitInfo() {
  const isDark = useThemeStore((s) => s.mode === "dark");
  const ui = getUiTokens(isDark);
  const [open, setOpen] = useState(false);
  const { data: plan } = useUserPlan();

  if (!plan) return null;

  const remaining = Math.max(plan.aiTaskLimit - plan.aiTaskUsage, 0);

  return (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setOpen((v) => !v)}
        hitSlop={8}
        activeOpacity={0.7}
        className="flex-row items-center gap-1.5 px-2.5 h-10 rounded-xl border border-outline-variant bg-surface-container-lowest"
      >
        <MaterialIcons name="bolt" size={16} color={ui.textSecondary} />
        <Text
          className="font-headline text-xs"
          style={{ color: remaining === 0 ? "#C0392B" : ui.textSecondary }}
        >
          {remaining} left
        </Text>
        <MaterialIcons name="info-outline" size={14} color={ui.textMuted} />
      </TouchableOpacity>

      {open && (
        <>
          <Pressable
            onPress={() => setOpen(false)}
            style={{
              position: "absolute",
              top: -1000,
              left: -1000,
              right: -1000,
              bottom: -1000,
            }}
          />
          <View
            className="absolute bottom-12 left-0 w-72 rounded-2xl bg-surface-container-lowest border border-outline-variant p-4 gap-3"
            style={{
              shadowColor: "#101828",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: isDark ? 0.4 : 0.12,
              shadowRadius: 24,
              elevation: 8,
              zIndex: 50,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-on-surface font-headline text-body-md">
                AI usage
              </Text>
              <View className="px-2.5 py-0.5 rounded-full bg-accent/10">
                <Text className="font-label text-[10px] uppercase tracking-widest text-accent">
                  {plan.planName}
                </Text>
              </View>
            </View>
            <PlanUsageBar
              icon="auto-awesome"
              label="AI calls today"
              used={plan.aiTaskUsage}
              limit={plan.aiTaskLimit}
              compact
            />
            <Text className="font-body text-xs" style={{ color: ui.textMuted }}>
              {remaining === 0
                ? "You've reached today's limit. It resets tomorrow."
                : `${remaining} request${remaining === 1 ? "" : "s"} left today.`}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}
