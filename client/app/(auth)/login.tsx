import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Button, Input } from "@/components/atoms";
import { AuthCard, AuthHeader } from "@/components/molecules/AuthCard";
import { useAuthStore } from "@/lib/stores";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { startGoogleOAuth } from "@/lib/oauth";
import { useT } from "@/lib/i18n";

export default function LoginScreen() {
  const router = useRouter();
  const t = useT();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginFormData) {
    setLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
    } catch (e: any) {
      if (e.response?.data?.title === "Identity.PasswordNotSet") {
        router.push({
          pathname: "/(auth)/setup-password",
          params: { email: data.email },
        } as never);
        return;
      }

      setError(
        e.response?.data?.detail ??
          e.response?.data?.message ??
          t("auth.invalidCredentials"),
      );
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleLogin() {
    setGoogleLoading(true);
    setError(null);
    try {
      await startGoogleOAuth();
    } catch (e: unknown) {
      const message =
        e instanceof Error
          ? e.message
          : t("auth.googleLoginFailed");
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  }

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
          <AuthCard>
            <TouchableOpacity
              onPress={() => router.push("/")}
              className="flex-row items-center gap-1.5 mb-6 self-start"
            >
              <MaterialIcons name="arrow-back" size={18} color="#888888" />
              <Text className="text-on-surface-variant font-body text-sm">
                {t("common.backToHome")}
              </Text>
            </TouchableOpacity>
            <AuthHeader subtitle={t("auth.loginSubtitle")} />

            {error && (
              <View className="bg-error-container rounded-xl px-4 py-3 mb-4">
                <Text className="text-on-error-container font-body text-sm">
                  {error}
                </Text>
              </View>
            )}

            <View className="gap-4">
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label={t("auth.emailLabel")}
                    icon="email"
                    placeholder="you@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={value}
                    onChangeText={onChange}
                    error={errors.email?.message}
                  />
                )}
              />
              <View>
                <Text className="text-on-surface font-label text-body-md mb-2">
                  {t("auth.password")}
                </Text>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      icon="lock"
                      placeholder="••••••••"
                      secureToggle
                      secureTextEntry
                      autoComplete="password"
                      value={value}
                      onChangeText={onChange}
                      error={errors.password?.message}
                      returnKeyType="go"
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                  )}
                />
                <TouchableOpacity
                  onPress={() => router.push("/(auth)/forgot-password")}
                  className="self-end mt-2"
                >
                  <Text className="text-primary font-label text-sm">
                    {t("auth.forgotPassword")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="mt-6">
              <Button
                label={t("auth.login")}
                icon="login"
                loading={loading}
                fullWidth
                onPress={handleSubmit(onSubmit)}
              />
            </View>

            <View className="mt-6">
              <TouchableOpacity
                onPress={onGoogleLogin}
                disabled={googleLoading || loading}
                className="flex-row items-center justify-center gap-3 bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant"
              >
                <MaterialIcons name="g-mobiledata" size={22} color="#4285F4" />
                <Text className="text-on-surface font-headline text-sm">
                  {googleLoading ? t("common.redirecting") : t("common.continueWithGoogle")}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-center gap-1 mt-6">
              <Text className="text-on-surface-variant font-body text-sm">
                {t("auth.noAccount")}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text className="text-primary font-headline text-sm">
                  {t("auth.register")}
                </Text>
              </TouchableOpacity>
            </View>
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
