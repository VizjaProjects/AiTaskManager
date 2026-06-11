import { View, Platform, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SideNavBar } from "./SideNavBar";
import { AppHeader } from "./AppHeader";

interface PageLayoutProps {
  title?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  rightRail?: React.ReactNode;
  /** Caps content width on very wide monitors without squeezing desktop layouts */
  constrained?: boolean;
  children: React.ReactNode;
}

function getContentMaxWidth(
  viewportWidth: number,
  isDesktop: boolean,
  constrained: boolean,
): number | undefined {
  if (!constrained) return undefined;
  if (!isDesktop) return undefined;
  const available = viewportWidth - 256 - 80;
  return Math.min(Math.max(available, 720), 1400);
}

export function PageLayout({
  title,
  showSearch = true,
  searchPlaceholder,
  rightRail,
  constrained = false,
  children,
}: PageLayoutProps) {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const contentMaxWidth = getContentMaxWidth(width, isDesktop, constrained);

  const inner = (
    <View className={`flex-1 w-full ${isDesktop ? "flex-row gap-6" : ""}`}>
      <View className="flex-1 min-w-0 w-full">{children}</View>
      {isDesktop && rightRail && (
        <View className="w-80 shrink-0">{rightRail}</View>
      )}
    </View>
  );

  const content =
    contentMaxWidth != null ? (
      <View
        className="flex-1 w-full self-stretch"
        style={{ maxWidth: contentMaxWidth }}
      >
        {inner}
      </View>
    ) : (
      inner
    );

  if (isDesktop) {
    return (
      <View className="flex-1 flex-row bg-background">
        <SideNavBar />
        <View className="flex-1 min-w-0">
          <AppHeader
            title={title}
            showSearch={showSearch}
            searchPlaceholder={searchPlaceholder}
          />
          <View
            className="flex-1 px-margin-desktop py-4 overflow-hidden"
            style={Platform.OS === "web" ? { paddingBottom: 48 } : undefined}
          >
            {content}
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <AppHeader
        title={title}
        showSearch={showSearch}
        searchPlaceholder={searchPlaceholder}
      />
      <View
        className="flex-1 px-5 py-3 overflow-hidden"
        style={Platform.OS === "web" ? { paddingBottom: 44 } : undefined}
      >
        {content}
        {rightRail && <View className="mt-4">{rightRail}</View>}
      </View>
    </SafeAreaView>
  );
}
