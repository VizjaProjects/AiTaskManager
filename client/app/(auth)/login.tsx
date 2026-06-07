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
import { InProgressBanner } from "@/components/molecules/InProgressBanner";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
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
      setError(e.response?.data?.message ?? "Nieprawidłowy email lub hasło");
    } finally {
      setLoading(false);
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
            <AuthHeader subtitle="Welcome back. Please log in to continue." />

            {error && (
              <View className="bg-error-container rounded-xl px-4 py-3 mb-4">
                <Text className="text-on-error-container font-body text-sm">{error}</Text>
              </View>
            )}

            <View className="gap-4">
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
                    autoComplete="email"
                    value={value}
                    onChangeText={onChange}
                    error={errors.email?.message}
                  />
                )}
              />
              <View>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-on-surface font-label text-body-md">Password</Text>
                  <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
                    <Text className="text-primary font-label text-sm">Forgot password?</Text>
                  </TouchableOpacity>
                </View>
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
              </View>
            </View>

            <View className="mt-6">
              <Button
                label="Zaloguj się"
                icon="login"
                loading={loading}
                fullWidth
                onPress={handleSubmit(onSubmit)}
              />
            </View>

            <View className="mt-6 opacity-50" pointerEvents="none">
              <View className="flex-row items-center justify-center gap-3 bg-surface-container-low rounded-xl px-4 py-3">
                <MaterialIcons name="g-mobiledata" size={22} color="#4285F4" />
                <Text className="text-on-surface font-headline text-sm">Kontynuuj z Google</Text>
              </View>
            </View>
            <InProgressBanner message="Logowanie Google będzie dostępne po implementacji OAuth w backendzie .NET." />

            <View className="flex-row items-center justify-center gap-1 mt-6">
              <Text className="text-on-surface-variant font-body text-sm">Nie masz konta?</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text className="text-primary font-headline text-sm">Zarejestruj się</Text>
              </TouchableOpacity>
            </View>
          </AuthCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
