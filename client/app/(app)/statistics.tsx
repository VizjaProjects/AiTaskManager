import { View, Text } from "react-native";
import { PageLayout } from "@/components/organisms";
import { InProgressBanner } from "@/components/molecules/InProgressBanner";
import { useT } from "@/lib/i18n";

export default function StatisticsScreen() {
  const t = useT();
  return (
    <PageLayout>
      <Text className="text-on-surface font-headline text-headline-md mb-4">
        {t("stats.title")}
      </Text>
      <View className="flex-1 justify-center p-6">
        <InProgressBanner
          variant="blocked"
          title={t("stats.bannerTitle")}
          message={t("stats.bannerMsg")}
        />
      </View>
    </PageLayout>
  );
}
