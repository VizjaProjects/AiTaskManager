import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import { Button } from "@/components/atoms";
import { authApi } from "@/lib/api";

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const { userId, email } = useLocalSearchParams<{
    userId: string;
    email: string;
  }>();
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  function handleChange(text: string, index: number) {
    const next = [...code];
    next[index] = text;
    setCode(next);

    if (text && index < CODE_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
    if (text && index === CODE_LENGTH - 1) {
      const full = next.join("");
      if (full.length === CODE_LENGTH) submitCode(full);
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  }

  async function submitCode(fullCode: string) {
    if (fullCode.length !== CODE_LENGTH) return;
    setLoading(true);
    setError(null);
    try {
      await authApi.verifyEmail(userId!, fullCode);
      setSuccess(true);
      setTimeout(() => router.replace("/(auth)/login"), 2000);
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Nieprawidłowy kod");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-8"
      >
        <View className="max-w-md w-full self-center gap-8 items-center">
          <View
            className={`w-20 h-20 rounded-full items-center justify-center ${
              success ? "bg-status-completed/20" : "bg-primary-fixed"
            }`}
          >
            <MaterialIcons
              name={success ? "check-circle" : "email"}
              size={40}
              color={success ? "#10B981" : "#4d41df"}
            />
          </View>

          <View className="items-center gap-2">
            <Text className="text-on-surface font-headline text-2xl text-center">
              {success ? "Email zweryfikowany!" : "Weryfikacja email"}
            </Text>
            <Text className="text-on-surface-variant font-body text-sm text-center">
              {success
                ? "Za chwilę zostaniesz przekierowany do logowania"
                : `Wpisz kod wysłany na ${email ?? "twój email"}`}
            </Text>
          </View>

          {error && (
            <View className="bg-error-container rounded-xl px-4 py-3 w-full">
              <Text className="text-on-error-container font-body text-sm text-center">
                {error}
              </Text>
            </View>
          )}

          {!success && (
            <>
              <View className="flex-row gap-3">
                {code.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(ref) => {
                      inputs.current[i] = ref;
                    }}
                    className="w-12 h-14 bg-surface-container-lowest rounded-xl text-center text-on-surface font-headline text-xl"
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(text) => handleChange(text, i)}
                    onKeyPress={({ nativeEvent }) =>
                      handleKeyPress(nativeEvent.key, i)
                    }
                  />
                ))}
              </View>

              <Button
                label="Zweryfikuj"
                loading={loading}
                fullWidth
                onPress={() => submitCode(code.join(""))}
                disabled={code.join("").length !== CODE_LENGTH}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
