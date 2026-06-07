import { View, Text } from "react-native";
import { PageLayout } from "@/components/organisms";
import { InProgressBanner } from "@/components/molecules/InProgressBanner";

export default function StatisticsScreen() {
  return (
    <PageLayout>
      <Text className="text-on-surface font-headline text-headline-md mb-4">
        AI Statistics
      </Text>
      <View className="flex-1 justify-center p-6">
        <InProgressBanner
          variant="blocked"
          title="Statystyki AI — w przygotowaniu"
          message="Moduł AiStatistic nie jest jeszcze zaimplementowany w backendzie .NET. Po dodaniu endpointów GET /ai-statistic/my i DELETE /ai-statistic/{id} ten ekran zostanie aktywowany."
        />
      </View>
    </PageLayout>
  );
}
