import { useState } from "react";
import { View } from "react-native";
import { Input } from "@/components/atoms";
import { PasswordRules } from "@/components/molecules/PasswordRules";
import { useT } from "@/lib/i18n";
import { isPasswordValid } from "@/lib/schemas";

// iOS strong-password generator follows these; mirrors PASSWORD_PATTERNS.
const IOS_PASSWORD_RULES = "minlength: 8; required: lower; required: upper; required: digit; required: special;";

/**
 * New password + repeat, with feedback timed to the user:
 * - password: rules light up while typing; unmet ones turn red only after leaving the field,
 * - repeat: "match" shows while typing, "mismatch" only after leaving the field.
 * Messages never contain the password and only full equality counts as a match.
 */
export function NewPasswordFields({
  password,
  confirm,
  onChangePassword,
  onChangeConfirm,
  passwordLabel,
  confirmLabel,
  passwordError,
  confirmError,
  onSubmitEditing,
  compact = false,
}: {
  password: string;
  confirm: string;
  onChangePassword: (value: string) => void;
  onChangeConfirm: (value: string) => void;
  passwordLabel: string;
  confirmLabel: string;
  /** Errors from a submit attempt (react-hook-form). */
  passwordError?: string;
  confirmError?: string;
  onSubmitEditing?: () => void;
  compact?: boolean;
}) {
  const t = useT();
  const [passwordLeft, setPasswordLeft] = useState(false);
  const [confirmLeft, setConfirmLeft] = useState(false);

  const passwordOk = isPasswordValid(password);
  const showRuleErrors = !passwordOk && (passwordLeft || !!passwordError);

  const matches = confirm.length > 0 && confirm === password;
  const showMismatch = !matches && ((confirmLeft && confirm.length > 0) || !!confirmError);

  const secureProps = {
    secureToggle: true,
    secureTextEntry: true,
    autoComplete: "new-password" as const,
    textContentType: "newPassword" as const,
    passwordRules: IOS_PASSWORD_RULES,
  };

  return (
    <View style={{ gap: compact ? 12 : 20 }}>
      <View>
        <Input
          tone="brand"
          label={passwordLabel}
          {...secureProps}
          value={password}
          onChangeText={onChangePassword}
          onBlur={() => password.length > 0 && setPasswordLeft(true)}
          error={showRuleErrors ? t("auth.pwNotValid") : undefined}
        />
        <PasswordRules password={password} showErrors={showRuleErrors} />
      </View>
      <Input
        tone="brand"
        label={confirmLabel}
        {...secureProps}
        value={confirm}
        onChangeText={onChangeConfirm}
        // Typing again gives the user a clean slate; the verdict comes on blur.
        onFocus={() => setConfirmLeft(false)}
        onBlur={() => setConfirmLeft(true)}
        error={showMismatch ? (confirm.length > 0 ? t("valid.passwordsMismatch") : confirmError) : undefined}
        success={matches ? t("auth.pwMatch") : undefined}
        returnKeyType="go"
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}
