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
import { useAuthStore } from "@/lib/stores";
import { registerSchema, type RegisterFormData } from "@/lib/schemas";

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      rawPassword: "",
      confirmPassword: "",
    },
  });

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
      });
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Błąd rejestracji");
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
            <View className="items-center gap-2">
              <MaterialIcons name="auto-awesome" size={48} color="#4d41df" />
              <Text className="text-on-surface font-headline text-3xl text-center">
                Utwórz konto
              </Text>
              <Text className="text-on-surface-variant font-body text-sm text-center">
                Dołącz do AI Task Manager
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
                name="rawPassword"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Hasło"
                    icon="lock"
                    placeholder="Min. 8 znaków"
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
                    label="Powtórz hasło"
                    icon="lock"
                    placeholder="••••••••"
                    secureTextEntry
                    value={value}
                    onChangeText={onChange}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />
            </View>

            <Button
              label="Zarejestruj się"
              loading={loading}
              fullWidth
              onPress={handleSubmit(onSubmit)}
            />

            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-on-surface-variant font-body text-sm">
                Masz już konto?
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-primary font-headline text-sm">
                  Zaloguj się
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
