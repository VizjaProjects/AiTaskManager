import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useUserPlan } from "@/lib/hooks";
import { PlanUsageBar } from "./PlanUsageBar";
import { AppModal } from "./AppModal";
import { getUiTokens } from "@/lib/utils/uiTokens";
import { useThemeStore } from "@/lib/stores";
import { useT } from "@/lib/i18n";

const PANEL_WIDTH = 288;
const GAP = 8;

/**
 * A subtle info affordance for the AI composer. Tapping it reveals a small
 * popover with the user's remaining AI calls for the day, so they know how many
 * requests are left before generating. Arena tokens + MaterialIcons only.
 */
export function AiLimitInfo() {
  const t = useT();
  const isDark = useThemeStore((s) => s.mode === "dark");
  const ui = getUiTokens(isDark);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const triggerRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number; width: number } | null>(null);
  const [open, setOpen] = useState(false);
  const { data: plan } = useUserPlan();

  if (!plan) return null;

  const remaining = Math.max(plan.aiTaskLimit - plan.aiTaskUsage, 0);

  function openPopover() {
    triggerRef.current?.measureInWindow((x, y, width) => {
      setAnchor({ x, y, width });
      setOpen(true);
    });
  }

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          onPress={openPopover}
          hitSlop={8}
          activeOpacity={0.7}
          className="flex-row items-center gap-1.5 px-2.5 h-10 rounded-xl border border-outline-variant bg-surface-container-lowest"
        >
          <MaterialIcons name="bolt" size={16} color={ui.textSecondary} />
          <Text
            className="font-headline text-xs"
            style={{ color: remaining === 0 ? ui.critical : ui.textSecondary }}
          >
            {t("aiLimit.left", { count: remaining })}
          </Text>
          <MaterialIcons name="info-outline" size={14} color={ui.textMuted} />
        </TouchableOpacity>
      </View>

      <AppModal
        visible={open}
        onRequestClose={() => setOpen(false)}
        dim={0.08}
        origin={anchor ? { x: anchor.x + anchor.width / 2, y: anchor.y } : null}
      >
        <Pressable className="flex-1" onPress={() => setOpen(false)}>
          {anchor ? (
            <View
              style={{
                position: "absolute",
                bottom: windowHeight - anchor.y + GAP,
                left: Math.min(Math.max(8, anchor.x), windowWidth - PANEL_WIDTH - 8),
              }}
              pointerEvents="box-none"
            >
              <Pressable onPress={(e) => e.stopPropagation()}>
                <View
                  className="rounded-2xl bg-surface-container-lowest border border-outline-variant p-4 gap-3"
                  style={{ width: PANEL_WIDTH, ...ui.shadow }}
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-on-surface font-headline text-body-md">
                      {t("aiLimit.title")}
                    </Text>
                    <View className="px-2.5 py-0.5 rounded-full bg-accent/10">
                      <Text className="font-label text-[10px] uppercase tracking-widest text-accent">
                        {plan.planName}
                      </Text>
                    </View>
                  </View>
                  <PlanUsageBar
                    icon="auto-awesome"
                    label={t("aiLimit.callsToday")}
                    used={plan.aiTaskUsage}
                    limit={plan.aiTaskLimit}
                    compact
                  />
                  <Text className="font-body text-xs" style={{ color: ui.textMuted }}>
                    {remaining === 0
                      ? t("aiLimit.reached")
                      : remaining === 1
                        ? t("aiLimit.remainingOne")
                        : t("aiLimit.remaining", { count: remaining })}
                  </Text>
                </View>
              </Pressable>
            </View>
          ) : null}
        </Pressable>
      </AppModal>
    </>
  );
}
