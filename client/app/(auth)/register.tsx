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
import { Button, Input, OrdovitaLogo } from "@/components/atoms";
import { AuthCard } from "@/components/molecules/AuthCard";
import { useAuthStore } from "@/lib/stores";
import { registerSchema, type RegisterFormData } from "@/lib/schemas";
import { startGoogleOAuth } from "@/lib/oauth";

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      rawPassword: "",
      confirmPassword: "",
      termsAccepted: false,
    },
  });

  const termsAccepted = watch("termsAccepted");

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    setError(null);
    try {
      const { userId } = await register(
        data.fullName,
        data.email,
        data.rawPassword,
      );
      router.replace({
        pathname: "/(auth)/verify-email",
        params: { userId, email: data.email },
      } as never);
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Błąd rejestracji");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleRegister() {
    if (!termsAccepted) {
      setError("Zaakceptuj regulamin i politykę prywatności, aby kontynuować.");
      return;
    }

    setGoogleLoading(true);
    setError(null);
    try {
      await startGoogleOAuth();
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : "Nie udało się rozpocząć rejestracji Google.";
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
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <AuthCard>
            <TouchableOpacity
              onPress={() => router.push("/")}
              className="flex-row items-center gap-1.5 mb-6 self-start"
            >
              <MaterialIcons name="arrow-back" size={18} color="#888888" />
              <Text className="text-on-surface-variant font-body text-sm">Back to home</Text>
            </TouchableOpacity>
            <View className="items-center gap-3 mb-8">
              <OrdovitaLogo size="lg" variant="stacked" />
              <Text className="text-on-surface font-headline text-headline-md">Create account</Text>
              <Text className="text-on-surface-variant font-body text-body-md text-center">
                Join your intelligent workspace.
              </Text>
            </View>

            {error && (
              <View className="bg-error-container rounded-xl px-4 py-3 mb-4">
                <Text className="text-on-error-container font-body text-sm">{error}</Text>
              </View>
            )}

            <View className="gap-4">
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Imię i nazwisko"
                    icon="person"
                    placeholder="Jan Kowalski"
                    autoCapitalize="words"
                    value={value}
                    onChangeText={onChange}
                    error={errors.fullName?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Adres e-mail"
                    icon="email"
                    placeholder="jan@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={value}
                    onChangeText={onChange}
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="rawPassword"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Hasło"
                    icon="lock"
                    placeholder="••••••••"
                    secureToggle
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    error={errors.rawPassword?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Potwierdź hasło"
                    icon="lock-reset"
                    placeholder="••••••••"
                    secureToggle
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    error={errors.confirmPassword?.message}
                    returnKeyType="go"
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />
            </View>

            <TouchableOpacity
              className="flex-row items-start gap-3 mt-5"
              onPress={() =>
                setValue("termsAccepted", !termsAccepted, {
                  shouldValidate: true,
                })
              }
            >
              <MaterialIcons
                name={termsAccepted ? "check-box" : "check-box-outline-blank"}
                size={22}
                color={termsAccepted ? "#4d41df" : "#777587"}
              />
              <Text className="flex-1 text-on-surface-variant font-body text-body-md">
                Akceptuję{" "}
                <Text
                  className="text-primary"
                  onPress={() => router.push("/terms-of-service" as never)}
                >
                  Regulamin
                </Text>{" "}
                i{" "}
                <Text
                  className="text-primary"
                  onPress={() => router.push("/privacy-policy" as never)}
                >
                  Politykę prywatności
                </Text>
              </Text>
            </TouchableOpacity>
            {errors.termsAccepted && (
              <Text className="text-error font-body text-xs mt-1">
                {errors.termsAccepted.message}
              </Text>
            )}

            <View className="mt-6">
              <Button
                label="Zarejestruj się"
                icon="arrow-forward"
                loading={loading}
                fullWidth
                onPress={handleSubmit(onSubmit)}
              />
            </View>

            <View className="mt-6">
              <TouchableOpacity
                onPress={onGoogleRegister}
                disabled={googleLoading || loading}
                className="flex-row items-center justify-center gap-3 bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant"
              >
                <MaterialIcons name="g-mobiledata" size={22} color="#4285F4" />
                <Text className="text-on-surface font-headline text-sm">
                  {googleLoading ? "Przekierowywanie…" : "Kontynuuj z Google"}
                </Text>
              </TouchableOpacity>
              <Text className="text-on-surface-variant font-body text-xs text-center mt-2">
                Pierwsze logowanie Google tworzy konto automatycznie.
              </Text>
            </View>

            <View className="flex-row items-center justify-center gap-1 mt-6">
              <Text className="text-on-surface-variant font-body text-sm">Masz już konto?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-primary font-headline text-sm">Zaloguj się</Text>
              </TouchableOpacity>
            </View>
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
