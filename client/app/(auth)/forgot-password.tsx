import {
  View,
  Text,
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
import { authApi } from "@/lib/api";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/lib/schemas";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setLoading(true);
    setError(null);
    try {
      await authApi.requestPasswordReset(data.email);
      setSent(true);
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Nie udało się wysłać linku");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <AuthCard showIllustration={false}>
            <AuthHeader
              title={sent ? "Link wysłany!" : "Resetuj hasło"}
              subtitle={
                sent
                  ? "Sprawdź swoją skrzynkę email i kliknij w link resetujący"
                  : "Podaj email, a wyślemy Ci link do resetowania hasła"
              }
            />

            <View className="items-center mb-6">
              <View className="w-16 h-16 rounded-full bg-primary-fixed items-center justify-center">
                <MaterialIcons
                  name={sent ? "mark-email-read" : "lock-reset"}
                  size={32}
                  color="#4d41df"
                />
              </View>
            </View>

            {error && (
              <View className="bg-error-container rounded-xl px-4 py-3 mb-4">
                <Text className="text-on-error-container font-body text-sm">{error}</Text>
              </View>
            )}

            {!sent && (
              <>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Email Address"
                      icon="email"
                      placeholder="you@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={value}
                      onChangeText={onChange}
                      error={errors.email?.message}
                      returnKeyType="go"
                      onSubmitEditing={handleSubmit(onSubmit)}
                    />
                  )}
                />
                <View className="mt-6">
                  <Button label="Wyślij link" loading={loading} fullWidth onPress={handleSubmit(onSubmit)} />
                </View>
              </>
            )}

            <View className="mt-4">
              <Button variant="text" label="Wróć do logowania" fullWidth onPress={() => router.push("/(auth)/login")} />
            </View>
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
