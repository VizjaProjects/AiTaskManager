import { Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useT } from "@/lib/i18n";
import { useThemeStore } from "@/lib/stores";
import { PASSWORD_MIN_LENGTH, passwordChecks } from "@/lib/schemas";
import { getBrandTokens } from "@/lib/utils/uiTokens";

/**
 * Live checklist of password requirements, same rules as passwordSchema.
 * `showErrors` marks unmet rules once the user has left the field.
 */
export function PasswordRules({ password, showErrors = false }: { password: string; showErrors?: boolean }) {
  const t = useT();
  const isDark = useThemeStore((s) => s.mode) === "dark";
  const brand = getBrandTokens(isDark);
  const checks = passwordChecks(password);

  const rules = [
    { label: t("auth.pwRuleLength", { n: PASSWORD_MIN_LENGTH }), ok: checks.length },
    { label: t("auth.pwRuleCase"), ok: checks.case },
    { label: t("auth.pwRuleDigit"), ok: checks.digit },
    { label: t("auth.pwRuleSpecial"), ok: checks.special },
  ];

  return (
    <View
      accessibilityLabel={t("auth.pwRulesLabel")}
      className="flex-row flex-wrap mt-2"
      style={{ rowGap: 6 }}
    >
      {rules.map((r) => {
        const failed = showErrors && !r.ok;
        return (
          <View
            key={r.label}
            className="flex-row items-center gap-2"
            style={{ width: "50%", paddingRight: 8 }}
            accessibilityLabel={`${r.label}: ${r.ok ? t("auth.pwRuleMet") : t("auth.pwRuleNotMet")}`}
          >
            <View
              className={`w-4 h-4 rounded-full items-center justify-center border ${
                r.ok ? "bg-brand-accent border-brand-accent" : failed ? "border-brand-error" : "border-brand-field"
              }`}
            >
              {r.ok && <MaterialIcons name="check" size={11} color={brand.onAccent} />}
              {failed && <MaterialIcons name="close" size={11} color={brand.error} />}
            </View>
            <Text
              className={`flex-1 font-body text-sm ${
                r.ok ? "text-brand-ink" : failed ? "text-brand-error" : "text-brand-muted"
              }`}
            >
              {r.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
