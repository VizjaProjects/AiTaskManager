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
import { useAuthStore } from "@/lib/stores";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { Linking } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

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
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          className="px-8"
        >
          <View className="max-w-md w-full self-center gap-8">
            <View className="items-center gap-3">
              <OrdovitaLogo size="lg" />
              <Text className="text-on-surface-variant font-body text-sm text-center">
                Zaloguj się, aby zarządzać swoimi zadaniami
              </Text>
            </View>

            {error && (
              <View className="bg-error-container rounded-xl px-4 py-3">
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
                    label="Email"
                    icon="email"
                    placeholder="name@company.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    value={value}
                    onChangeText={onChange}
                    error={errors.email?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Hasło"
                    icon="lock"
                    placeholder="••••••••"
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

            <TouchableOpacity
              onPress={() => router.push("/(auth)/forgot-password")}
              className="self-end"
            >
              <Text className="text-primary font-label text-sm">
                Zapomniałeś hasła?
              </Text>
            </TouchableOpacity>

            <Button
              label="Zaloguj się"
              loading={loading}
              fullWidth
              onPress={handleSubmit(onSubmit)}
            />

            <View className="flex-row items-center gap-3">
              <View className="flex-1 h-px bg-outline-variant" />
              <Text className="text-on-surface-variant font-body text-xs">
                lub
              </Text>
              <View className="flex-1 h-px bg-outline-variant" />
            </View>

            <TouchableOpacity
              onPress={() => {
                const url = `${API_URL}/oauth2/authorization/google`;
                if (Platform.OS === "web") {
                  window.location.href = url;
                } else {
                  Linking.openURL(url);
                }
              }}
              className="flex-row items-center justify-center gap-3 bg-surface-container-high border border-outline-variant rounded-xl px-4 py-3"
            >
              <MaterialIcons name="g-mobiledata" size={22} color="#4285F4" />
              <Text className="text-on-surface font-headline text-sm">
                Kontynuuj z Google
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-on-surface-variant font-body text-sm">
                Nie masz konta?
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
                <Text className="text-primary font-headline text-sm">
                  Zarejestruj się
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-center gap-3 mt-2">
              <TouchableOpacity
                onPress={() => router.push("/privacy-policy" as never)}
              >
                <Text className="text-on-surface-variant font-body text-xs underline">
                  Polityka prywatności
                </Text>
              </TouchableOpacity>
              <Text className="text-on-surface-variant text-xs">•</Text>
              <TouchableOpacity
                onPress={() => router.push("/terms-of-service" as never)}
              >
                <Text className="text-on-surface-variant font-body text-xs underline">
                  Regulamin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
