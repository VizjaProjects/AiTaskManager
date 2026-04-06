import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";

export default function TermsOfServiceScreen() {
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
            <MaterialIcons name="gavel" size={40} color="#4d41df" />
            <Text className="text-on-surface font-headline text-2xl text-center">
              Regulamin
            </Text>
            <Text className="text-on-surface-variant font-body text-sm text-center">
              Ordovita — AI Task Manager
            </Text>
            <Text className="text-on-surface-variant font-body text-xs">
              Ostatnia aktualizacja: 6 kwietnia 2026
            </Text>
          </View>

          <Section title="1. Postanowienia ogólne">
            <P>
              Niniejszy regulamin określa zasady korzystania z aplikacji
              Ordovita — AI Task Manager, dostępnej pod adresem ordovita.pl oraz
              w formie aplikacji mobilnej (dalej: „Aplikacja").
            </P>
            <P>
              Właścicielem i operatorem Aplikacji jest Ordovita z siedzibą przy
              ordovita.pl (dalej: „Usługodawca").
            </P>
          </Section>

          <Section title="2. Definicje">
            <Bullet>
              Użytkownik — osoba fizyczna korzystająca z Aplikacji
            </Bullet>
            <Bullet>
              Konto — indywidualne konto Użytkownika zabezpieczone hasłem
            </Bullet>
            <Bullet>
              Usługa — funkcjonalności Aplikacji, w tym zarządzanie zadaniami,
              kalendarzem, propozycje AI
            </Bullet>
            <Bullet>
              Treści Użytkownika — zadania, kategorie, statusy, wydarzenia i
              inne dane tworzone przez Użytkownika
            </Bullet>
          </Section>

          <Section title="3. Rejestracja i konto">
            <Bullet>
              Rejestracja wymaga podania imienia i nazwiska, adresu e-mail i
              hasła
            </Bullet>
            <Bullet>
              Konto wymaga weryfikacji adresu e-mail kodem jednorazowym
            </Bullet>
            <Bullet>
              Użytkownik może również zalogować się za pomocą konta Google
            </Bullet>
            <Bullet>
              Użytkownik jest odpowiedzialny za bezpieczeństwo swojego hasła
            </Bullet>
            <Bullet>Jedno konto przypada na jeden adres e-mail</Bullet>
          </Section>

          <Section title="4. Zasady korzystania">
            <P>Użytkownik zobowiązuje się do:</P>
            <Bullet>
              Korzystania z Aplikacji zgodnie z prawem i niniejszym regulaminem
            </Bullet>
            <Bullet>
              Niepodejmowania prób nieautoryzowanego dostępu do systemu
            </Bullet>
            <Bullet>
              Nieumieszczania treści nielegalnych, szkodliwych lub naruszających
              prawa osób trzecich
            </Bullet>
            <Bullet>
              Niepodejmowania działań mogących zakłócić działanie Aplikacji
            </Bullet>
          </Section>

          <Section title="5. Funkcjonalności AI">
            <P>
              Aplikacja oferuje funkcje oparte na sztucznej inteligencji (AI), w
              tym automatyczne propozycje zadań i planowanie. Propozycje AI mają
              charakter pomocniczy — ostateczna decyzja należy do Użytkownika.
            </P>
            <P>
              Usługodawca nie ponosi odpowiedzialności za decyzje podjęte na
              podstawie propozycji AI.
            </P>
          </Section>

          <Section title="6. Integracje z usługami trzecimi">
            <P>Aplikacja umożliwia integrację z usługami zewnętrznymi:</P>
            <Bullet>Google Sign-In — logowanie za pomocą konta Google</Bullet>
            <Bullet>
              Microsoft Outlook Calendar — import wydarzeń z kalendarza (tylko
              odczyt)
            </Bullet>
            <P>
              Korzystanie z integracji jest dobrowolne i wymaga wyrażenia
              odrębnej zgody. Użytkownik może w każdej chwili odłączyć
              integrację w ustawieniach konta.
            </P>
          </Section>

          <Section title="7. Własność intelektualna">
            <P>
              Aplikacja, jej kod źródłowy, design, logo i nazwa „Ordovita"
              stanowią własność Usługodawcy. Treści utworzone przez Użytkownika
              pozostają jego własnością.
            </P>
          </Section>

          <Section title="8. Dostępność usługi">
            <P>
              Usługodawca dokłada starań, aby Aplikacja była dostępna 24/7,
              jednak nie gwarantuje nieprzerwanego dostępu. Przerwy techniczne
              mogą być konieczne w celu konserwacji i aktualizacji.
            </P>
          </Section>

          <Section title="9. Usunięcie konta">
            <P>
              Użytkownik może w każdej chwili usunąć swoje konto wraz ze
              wszystkimi danymi. Usunięcie jest trwałe i nieodwracalne. Można to
              zrobić w Ustawieniach konta lub kontaktując się z nami:
              kontakt@ordovita.pl.
            </P>
          </Section>

          <Section title="10. Ograniczenie odpowiedzialności">
            <P>Usługodawca nie ponosi odpowiedzialności za:</P>
            <Bullet>
              Straty wynikające z utraty danych spowodowanej działaniem
              Użytkownika
            </Bullet>
            <Bullet>
              Przerwy w dostępie do Aplikacji z przyczyn niezależnych od
              Usługodawcy
            </Bullet>
            <Bullet>
              Decyzje podjęte na podstawie propozycji generowanych przez AI
            </Bullet>
            <Bullet>Działania usług trzecich (Google, Microsoft)</Bullet>
          </Section>

          <Section title="11. Zmiany w regulaminie">
            <P>
              Usługodawca zastrzega sobie prawo do zmiany regulaminu. O zmianach
              Użytkownik zostanie poinformowany za pośrednictwem Aplikacji lub
              e-maila. Kontynuowanie korzystania z Aplikacji po zmianach oznacza
              akceptację nowego regulaminu.
            </P>
          </Section>

          <Section title="12. Prawo właściwe">
            <P>
              Regulamin podlega prawu polskiemu. Spory wynikające z korzystania
              z Aplikacji będą rozstrzygane przez sąd właściwy dla siedziby
              Usługodawcy.
            </P>
          </Section>

          <Section title="13. Kontakt">
            <P>
              W razie pytań lub wątpliwości, skontaktuj się z nami:{"\n"}
              E-mail: kontakt@ordovita.pl{"\n"}
              Strona: ordovita.pl
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
