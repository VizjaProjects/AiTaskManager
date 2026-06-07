import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Button } from "@/components/atoms";
import { AuthCard, AuthHeader } from "@/components/molecules/AuthCard";
import { InProgressBanner } from "@/components/molecules/InProgressBanner";
import { identityApi } from "@/lib/api";

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ userId: string; email: string }>();
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1">
      <AuthCard showIllustration={false}>
        <View className="items-center mb-6">
          <View className="w-16 h-16 rounded-full bg-primary-fixed items-center justify-center">
            <MaterialIcons name="email" size={32} color="#4d41df" />
          </View>
        </View>

        <AuthHeader title="Potwierdź email" />

        <Text className="text-on-surface-variant font-body text-body-md text-center mb-6">
          Wysłaliśmy link aktywacyjny na adres{" "}
          <Text className="font-headline text-on-surface">{email}</Text>. Kliknij
          link w wiadomości, aby aktywować konto.
        </Text>

        <InProgressBanner message="Weryfikacja 6-cyfrowym kodem nie jest dostępna w backendzie .NET. Użyj linku z wiadomości email." />

        <View className="gap-3 mt-4">
          <Button
            label="Wyślij ponownie link"
            variant="outline"
            fullWidth
            onPress={async () => {
              if (email) await identityApi.resendConfirmationEmail(email);
            }}
          />
          <Button
            label="Przejdź do logowania"
            fullWidth
            onPress={() => router.replace("/(auth)/login")}
          />
        </View>
      </AuthCard>
    </SafeAreaView>
  );
}
