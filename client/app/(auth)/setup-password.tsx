import { Text, View } from "react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BrandButton, Input } from "@/components/atoms";
import { NewPasswordFields } from "@/components/molecules/NewPasswordFields";
import {
  AuthAlert,
  AuthHeading,
  AuthTextLink,
} from "@/components/organisms/AuthSplitLayout";
import { identityApi } from "@/lib/api";
import {
  setupPasswordSchema,
  type SetupPasswordFormData,
} from "@/lib/schemas";
import { useAuthStore } from "@/lib/stores";
import { useT } from "@/lib/i18n";
import { getApiErrorMessage } from "@/lib/utils/apiErrors";

type SetupStep = "password" | "confirmation";

export default function SetupPasswordScreen() {
  const router = useRouter();
  const t = useT();
  const params = useLocalSearchParams<{ email?: string }>();
  const login = useAuthStore((state) => state.login);
  const email = typeof params.email === "string" ? params.email : "";
  const [step, setStep] = useState<SetupStep>("password");
  const [resetCode, setResetCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<SetupPasswordFormData>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });
  const newPassword = watch("newPassword");
  const repeatedPassword = watch("confirmPassword");

  function setPasswordField(name: "newPassword" | "confirmPassword", value: string) {
    setValue(name, value);
    if (isSubmitted) trigger(["newPassword", "confirmPassword"]);
  }

  useEffect(() => {
    if (!email) router.replace("/(auth)/login");
  }, [email, router]);

  async function requestConfirmation() {
    setLoading(true);
    setError(null);
    try {
      await identityApi.forgotPassword(email);
      setStep("confirmation");
    } catch (requestError: any) {
      setError(getApiErrorMessage(requestError, t("auth.sp.sendError")));
    } finally {
      setLoading(false);
    }
  }

  async function confirmPassword() {
    if (!resetCode.trim()) {
      setError(t("auth.sp.enterCode"));
      return;
    }

    setLoading(true);
    setError(null);
    const password = getValues("newPassword");

    try {
      await identityApi.resetPassword({
        email,
        resetCode: resetCode.trim(),
        newPassword: password,
      });
      await login(email, password);
      router.replace("/(app)/tasks");
    } catch (confirmationError: any) {
      setError(getApiErrorMessage(confirmationError, t("auth.sp.codeInvalid")));
    } finally {
      setLoading(false);
    }
  }

  if (!email) return null;

  return (
    <View className="gap-5">
      <AuthHeading
        title={
          step === "password"
            ? t("auth.sp.titlePassword")
            : t("auth.sp.titleConfirm")
        }
      >
        <Text className="text-brand-muted font-body text-base leading-6">
          {step === "password"
            ? t("auth.sp.subtitlePassword", { email })
            : t("auth.sp.subtitleConfirm", { email })}
        </Text>
      </AuthHeading>

      {error && <AuthAlert message={error} />}

      {step === "password" ? (
        <>
          <NewPasswordFields
            password={newPassword}
            confirm={repeatedPassword}
            onChangePassword={(v) => setPasswordField("newPassword", v)}
            onChangeConfirm={(v) => setPasswordField("confirmPassword", v)}
            passwordLabel={t("auth.sp.newPassword")}
            confirmLabel={t("auth.sp.repeatPassword")}
            passwordError={errors.newPassword?.message}
            confirmError={errors.confirmPassword?.message}
            onSubmitEditing={handleSubmit(requestConfirmation)}
          />
          <BrandButton
            label={t("auth.sp.sendCode")}
            size="lg"
            fullWidth
            loading={loading}
            onPress={handleSubmit(requestConfirmation)}
          />
        </>
      ) : (
        <>
          <Input
            tone="brand"
            label={t("auth.fp.codeLabel")}
            placeholder={t("auth.fp.codePlaceholder")}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="one-time-code"
            value={resetCode}
            onChangeText={setResetCode}
            returnKeyType="go"
            onSubmitEditing={confirmPassword}
          />
          <BrandButton
            label={t("auth.sp.confirmSet")}
            size="lg"
            fullWidth
            loading={loading}
            onPress={confirmPassword}
          />
          <View className="self-start">
            <AuthTextLink
              label={t("auth.sp.resendCode")}
              tone="ink"
              onPress={() => {
                if (!loading) requestConfirmation();
              }}
            />
          </View>
        </>
      )}

      <View className="self-start">
        <AuthTextLink
          label={t("auth.backToLogin")}
          tone="muted"
          onPress={() => router.replace("/(auth)/login")}
        />
      </View>
    </View>
  );
}
