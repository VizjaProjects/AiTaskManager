import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input } from "@/components/atoms";
import { AuthCard, AuthHeader } from "@/components/molecules/AuthCard";
import { identityApi } from "@/lib/api";
import {
  setupPasswordSchema,
  type SetupPasswordFormData,
} from "@/lib/schemas";
import { useAuthStore } from "@/lib/stores";
import { useT } from "@/lib/i18n";

type SetupStep = "password" | "confirmation";

function getApiErrorMessage(error: any, fallback: string): string {
  const validationErrors = error.response?.data?.errors;
  const firstValidationError =
    validationErrors && typeof validationErrors === "object"
      ? Object.values(validationErrors)
          .flat()
          .find((value) => typeof value === "string")
      : undefined;

  return (
    firstValidationError ??
    error.response?.data?.detail ??
    error.response?.data?.message ??
    fallback
  );
}

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
    formState: { errors },
  } = useForm<SetupPasswordFormData>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

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
      setError(
        getApiErrorMessage(
          requestError,
          t("auth.sp.sendError"),
        ),
      );
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
    const newPassword = getValues("newPassword");

    try {
      await identityApi.resetPassword({
        email,
        resetCode: resetCode.trim(),
        newPassword,
      });
      await login(email, newPassword);
      router.replace("/(app)/tasks");
    } catch (confirmationError: any) {
      setError(
        getApiErrorMessage(
          confirmationError,
          t("auth.sp.codeInvalid"),
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  if (!email) return null;

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <AuthCard showIllustration={false}>
            <AuthHeader
              title={
                step === "password"
                  ? t("auth.sp.titlePassword")
                  : t("auth.sp.titleConfirm")
              }
              subtitle={
                step === "password"
                  ? t("auth.sp.subtitlePassword", { email })
                  : t("auth.sp.subtitleConfirm", { email })
              }
            />

            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-primary-fixed items-center justify-center">
                <MaterialIcons
                  name={step === "password" ? "password" : "mark-email-read"}
                  size={32}
                  color="#4d41df"
                />
              </View>
            </View>

            {error && (
              <View className="bg-error-container rounded-xl px-4 py-3 mb-4">
                <Text className="text-on-error-container font-body text-sm">
                  {error}
                </Text>
              </View>
            )}

            {step === "password" ? (
              <View className="gap-4">
                <Controller
                  control={control}
                  name="newPassword"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label={t("auth.sp.newPassword")}
                      icon="lock"
                      secureToggle
                      secureTextEntry
                      autoComplete="new-password"
                      value={value}
                      onChangeText={onChange}
                      error={errors.newPassword?.message}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label={t("auth.sp.repeatPassword")}
                      icon="lock"
                      secureToggle
                      secureTextEntry
                      autoComplete="new-password"
                      value={value}
                      onChangeText={onChange}
                      error={errors.confirmPassword?.message}
                      returnKeyType="go"
                      onSubmitEditing={handleSubmit(requestConfirmation)}
                    />
                  )}
                />
                <Button
                  label={t("auth.sp.sendCode")}
                  loading={loading}
                  fullWidth
                  onPress={handleSubmit(requestConfirmation)}
                />
              </View>
            ) : (
              <View className="gap-4">
                <Input
                  label={t("auth.sp.codeLabel")}
                  icon="verified-user"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={resetCode}
                  onChangeText={setResetCode}
                  returnKeyType="go"
                  onSubmitEditing={confirmPassword}
                />
                <Button
                  label={t("auth.sp.confirmSet")}
                  loading={loading}
                  fullWidth
                  onPress={confirmPassword}
                />
                <Button
                  variant="text"
                  label={t("auth.sp.resendCode")}
                  disabled={loading}
                  fullWidth
                  onPress={requestConfirmation}
                />
              </View>
            )}

            <View className="mt-4">
              <Button
                variant="text"
                label={t("auth.backToLogin")}
                fullWidth
                onPress={() => router.replace("/(auth)/login")}
              />
            </View>
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
