import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, OrdovitaLogo } from "@/components/atoms";
import { useAuthStore } from "@/lib/stores";

export default function Index() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    router.replace("/(app)/dashboard");
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6">
        <View className="max-w-5xl w-full self-center flex-1 py-8 justify-center gap-10">
          <View className="items-center gap-4">
            <OrdovitaLogo size="lg" />
            <View className="items-center gap-3">
              <Text className="text-on-surface font-headline text-4xl text-center">
                Ordovita
              </Text>
              <Text className="text-on-surface-variant font-body text-base text-center max-w-2xl leading-7">
                Planuj zadania, porzadkuj kalendarz i buduj dzien z pomoca AI.
                Ta strona jest publiczna i zawiera podstawowe informacje o
                aplikacji, zanim zalogujesz sie do swojego konta.
              </Text>
            </View>
          </View>

          <View className="flex-col md:flex-row gap-4 justify-center items-stretch">
            <View className="bg-surface rounded-3xl border border-outline-variant p-6 gap-4 flex-1 max-w-xl">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-2xl bg-primary-fixed items-center justify-center">
                  <MaterialIcons
                    name="auto-awesome"
                    size={24}
                    color="#4d41df"
                  />
                </View>
                <Text className="text-on-surface font-headline text-xl">
                  Co oferuje Ordovita
                </Text>
              </View>

              <Feature text="Zarzadzanie zadaniami, kategoriami i statusami" />
              <Feature text="Kalendarz i planowanie dnia w jednym miejscu" />
              <Feature text="Sugestie AI wspierajace organizacje pracy" />
              <Feature text="Bezpieczne konto z prywatnoscia i kontrola danych" />
            </View>

            <View className="bg-surface rounded-3xl border border-outline-variant p-6 gap-4 flex-1 max-w-xl">
              <Text className="text-on-surface font-headline text-xl">
                Zacznij korzystac
              </Text>
              <Text className="text-on-surface-variant font-body text-sm leading-6">
                Mozesz zalozyc konto lub przejsc do logowania. Informacje o
                polityce prywatnosci i warunkach korzystania sa dostepne bez
                logowania, zgodnie z wymaganiami Google OAuth.
              </Text>

              <Button
                label="Zaloguj sie"
                fullWidth
                onPress={() => router.push("/(auth)/login")}
              />
              <Button
                label="Zarejestruj sie"
                variant="outline"
                fullWidth
                onPress={() => router.push("/(auth)/register")}
              />

              <View className="pt-2 gap-3">
                <TouchableOpacity
                  onPress={() => router.push("/privacy-policy" as never)}
                >
                  <Text className="text-primary font-headline text-sm underline">
                    Polityka prywatnosci
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push("/terms-of-service" as never)}
                >
                  <Text className="text-primary font-headline text-sm underline">
                    Regulamin
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text className="text-on-surface-variant font-body text-xs text-center">
            kontakt@ordovita.pl | https://ordovita.pl
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <View className="flex-row items-start gap-3">
      <MaterialIcons name="check-circle" size={18} color="#4d41df" />
      <Text className="flex-1 text-on-surface-variant font-body text-sm leading-6">
        {text}
      </Text>
    </View>
  );
}
