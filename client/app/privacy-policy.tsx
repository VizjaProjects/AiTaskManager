import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-4">
        <View className="max-w-3xl w-full self-center py-8 gap-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center gap-1 mb-2"
          >
            <MaterialIcons name="arrow-back" size={20} color="#4d41df" />
            <Text className="text-primary font-headline text-sm">Wróć</Text>
          </TouchableOpacity>

          <View className="items-center gap-2 mb-4">
            <MaterialIcons name="shield" size={40} color="#4d41df" />
            <Text className="text-on-surface font-headline text-2xl text-center">
              Polityka Prywatności
            </Text>
            <Text className="text-on-surface-variant font-body text-sm text-center">
              Ordovita — AI Task Manager
            </Text>
            <Text className="text-on-surface-variant font-body text-xs">
              Ostatnia aktualizacja: 6 kwietnia 2026
            </Text>
          </View>

          <Section title="1. Administrator Danych">
            <P>
              Administratorem Twoich danych osobowych jest Ordovita z siedzibą
              przy ordovita.pl (dalej: „Administrator", „my"). Kontakt z
              Administratorem: kontakt@ordovita.pl.
            </P>
          </Section>

          <Section title="2. Jakie dane zbieramy">
            <P>
              W ramach korzystania z aplikacji Ordovita — AI Task Manager
              zbieramy:
            </P>
            <Bullet>Imię i nazwisko — używane do personalizacji konta</Bullet>
            <Bullet>
              Adres e-mail — używany do logowania, komunikacji i weryfikacji
              konta
            </Bullet>
            <Bullet>
              Hasło — przechowywane w formie zaszyfrowanej (bcrypt)
            </Bullet>
            <Bullet>
              Dane zadań, kategorii, statusów i wydarzeń — tworzone przez
              użytkownika w aplikacji
            </Bullet>
            <Bullet>
              Adres IP i nazwa urządzenia — używane do zarządzania sesjami i
              bezpieczeństwa
            </Bullet>
            <Bullet>
              Dane z konta Google (jeśli logujesz się przez Google) — imię,
              nazwisko, e-mail, zdjęcie profilowe
            </Bullet>
            <Bullet>
              Dane kalendarza Microsoft Outlook (jeśli połączysz konto) —
              wydarzenia kalendarza w trybie tylko do odczytu
            </Bullet>
          </Section>

          <Section title="3. Cel przetwarzania danych">
            <P>Twoje dane przetwarzamy w celu:</P>
            <Bullet>
              Świadczenia usługi — zarządzanie zadaniami, kalendarzem,
              propozycjami AI
            </Bullet>
            <Bullet>
              Uwierzytelniania — logowanie, rejestracja, odświeżanie sesji
            </Bullet>
            <Bullet>
              Bezpieczeństwa — ochrona konta, wykrywanie nieautoryzowanego
              dostępu
            </Bullet>
            <Bullet>
              Komunikacji — wysyłanie kodów weryfikacyjnych, powiadomień o
              zmianie hasła
            </Bullet>
            <Bullet>
              Integracji z usługami trzecimi — Google Sign-In, Microsoft Outlook
              Calendar
            </Bullet>
          </Section>

          <Section title="4. Podstawa prawna">
            <Bullet>
              Art. 6 ust. 1 lit. a RODO — Twoja zgoda (np. na integracje z
              Google/Microsoft)
            </Bullet>
            <Bullet>
              Art. 6 ust. 1 lit. b RODO — wykonanie umowy (świadczenie usługi)
            </Bullet>
            <Bullet>
              Art. 6 ust. 1 lit. f RODO — prawnie uzasadniony interes
              (bezpieczeństwo)
            </Bullet>
          </Section>

          <Section title="5. Udostępnianie danych">
            <P>Twoje dane mogą być przekazywane:</P>
            <Bullet>
              Google LLC — w ramach Google Sign-In (OAuth 2.0), wyłącznie dane
              potrzebne do logowania
            </Bullet>
            <Bullet>
              Microsoft Corporation — w ramach integracji z Outlook Calendar
              (Microsoft Graph API), wyłącznie odczyt wydarzeń
            </Bullet>
            <Bullet>
              Google Gemini AI — treści zadań w celu generowania propozycji AI
              (bez danych osobowych)
            </Bullet>
            <P>
              Nie sprzedajemy, nie udostępniamy i nie wykorzystujemy Twoich
              danych do celów reklamowych.
            </P>
          </Section>

          <Section title="6. Okres przechowywania">
            <Bullet>Dane konta — przez czas istnienia konta</Bullet>
            <Bullet>Sesje — 7 dni od ostatniego logowania</Bullet>
            <Bullet>
              Po usunięciu konta — wszystkie dane są trwale usuwane
            </Bullet>
          </Section>

          <Section title="7. Twoje prawa">
            <P>Zgodnie z RODO masz prawo do:</P>
            <Bullet>Dostępu do swoich danych</Bullet>
            <Bullet>Sprostowania danych</Bullet>
            <Bullet>Usunięcia danych (prawo do bycia zapomnianym)</Bullet>
            <Bullet>Ograniczenia przetwarzania</Bullet>
            <Bullet>Przenoszenia danych</Bullet>
            <Bullet>Cofnięcia zgody w dowolnym momencie</Bullet>
            <Bullet>Złożenia skargi do Prezesa UODO</Bullet>
            <P>
              Aby skorzystać z tych praw, skontaktuj się z nami:
              kontakt@ordovita.pl.
            </P>
          </Section>

          <Section title="8. Usuwanie danych">
            <P>
              Możesz w każdej chwili usunąć swoje konto i wszystkie powiązane
              dane. Wystarczy przejść do Ustawienia konta → Usuń konto, lub
              wysłać e-mail na kontakt@ordovita.pl. Usunięcie jest trwałe i
              nieodwracalne.
            </P>
          </Section>

          <Section title="9. Bezpieczeństwo">
            <P>
              Stosujemy odpowiednie środki techniczne i organizacyjne, w tym:
            </P>
            <Bullet>Szyfrowanie haseł (bcrypt)</Bullet>
            <Bullet>Tokeny JWT z krótkim czasem życia (15 minut)</Bullet>
            <Bullet>Refresh tokeny w HttpOnly cookies</Bullet>
            <Bullet>Połączenia HTTPS w środowisku produkcyjnym</Bullet>
          </Section>

          <Section title="10. Pliki cookies">
            <P>
              Aplikacja używa wyłącznie technicznych plików cookies niezbędnych
              do działania (refresh token). Nie używamy cookies marketingowych
              ani analitycznych.
            </P>
          </Section>

          <Section title="11. Zmiany w polityce">
            <P>
              O wszelkich zmianach w Polityce Prywatności poinformujemy Cię za
              pośrednictwem aplikacji lub e-maila. Kontynuowanie korzystania z
              aplikacji po zmianach oznacza ich akceptację.
            </P>
          </Section>

          <View className="border-t border-outline-variant pt-6 mt-4 mb-8">
            <Text className="text-on-surface-variant font-body text-xs text-center">
              © 2026 Ordovita. Wszelkie prawa zastrzeżone.{"\n"}
              kontakt@ordovita.pl | ordovita.pl
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="text-on-surface font-headline text-base">{title}</Text>
      {children}
    </View>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Text className="text-on-surface-variant font-body text-sm leading-6">
      {children}
    </Text>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-row pl-2 gap-2">
      <Text className="text-on-surface-variant font-body text-sm">•</Text>
      <Text className="text-on-surface-variant font-body text-sm leading-6 flex-1">
        {children}
      </Text>
    </View>
  );
}
