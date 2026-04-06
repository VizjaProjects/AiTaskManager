import { View, Platform, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SideNavBar } from "./SideNavBar";
import { TopAppBar } from "./TopAppBar";

interface PageLayoutProps {
  title: string;
  showSearch?: boolean;
  children: React.ReactNode;
}

export function PageLayout({ title, showSearch, children }: PageLayoutProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;

  if (isDesktop) {
    return (
      <View className="flex-1 flex-row bg-background">
        <SideNavBar />
        <View className="flex-1">
          <TopAppBar title={title} showSearch={showSearch} />
          <View className="flex-1 px-8 py-4">{children}</View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <TopAppBar title={title} showSearch={showSearch} />
      <View className="flex-1 px-4 py-2 overflow-hidden">{children}</View>
    </SafeAreaView>
  );
}
