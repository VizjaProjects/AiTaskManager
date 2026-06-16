import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms";
import { Button, Card, EmptyState } from "@/components/atoms";
import { useWorkspaces, useSetActiveWorkspace } from "@/lib/hooks";
import { useWorkspaceStore } from "@/lib/stores";
import { useT } from "@/lib/i18n";

export default function WorkspacesScreen() {
  const router = useRouter();
  const t = useT();
  const { workspaces, isLoading } = useWorkspaces();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActive = useSetActiveWorkspace();

  return (
    <PageLayout>
      <View className="gap-4 p-4 max-w-2xl w-full self-center">
        <View className="flex-row items-center justify-between">
          <Text className="text-on-surface-variant font-body text-sm">
            {t("ws.manage")}
          </Text>
          <Button
            label={t("ws.new")}
            onPress={() => router.push("/(app)/workspace-create" as never)}
          />
        </View>

        {isLoading ? (
          <Text className="text-on-surface-variant font-body text-sm">
            {t("common.loading")}
          </Text>
        ) : workspaces.length === 0 ? (
          <EmptyState
            title={t("ws.empty")}
            description={t("ws.emptyDesc")}
            primaryAction={{
              label: t("ws.create"),
              onPress: () => router.push("/(app)/workspace-create" as never),
            }}
          />
        ) : (
          <ScrollView className="gap-3" showsVerticalScrollIndicator={false}>
            {workspaces.map((ws) => {
              const isActive = ws.workspaceId === activeWorkspaceId;
              return (
                <Card key={ws.workspaceId} className="p-4">
                  <TouchableOpacity
                    onPress={() => {
                      setActive.mutate(ws.workspaceId);
                      router.back();
                    }}
                    className="gap-2"
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-on-surface font-headline text-base">
                        {ws.workspaceName}
                      </Text>
                      {isActive && (
                        <View className="bg-primary/15 px-2 py-0.5 rounded-full">
                          <Text className="text-primary font-label text-xs">
                            {t("ws.active")}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-on-surface-variant font-body text-xs">
                      {ws.assignedUsers.length} {t("ws.membersWord")} ·{" "}
                      {t("ws.createdWord")}{" "}
                      {new Date(ws.createdAt).toLocaleDateString("pl-PL")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/(app)/workspace-settings",
                        params: { workspaceId: ws.workspaceId },
                      } as never)
                    }
                    className="flex-row items-center gap-1 mt-3 pt-3 border-t border-outline-variant/20"
                  >
                    <MaterialIcons name="settings" size={16} color="#777587" />
                    <Text className="text-on-surface-variant font-body text-sm">
                      {t("menu.settings")}
                    </Text>
                  </TouchableOpacity>
                </Card>
              );
            })}
          </ScrollView>
        )}
      </View>
    </PageLayout>
  );
}
