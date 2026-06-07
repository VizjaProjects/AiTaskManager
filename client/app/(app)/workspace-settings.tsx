import { View, Text, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PageLayout } from "@/components/organisms";
import { Button, Card } from "@/components/atoms";
import { useWorkspaces, useDeleteWorkspace } from "@/lib/hooks";
import { useWorkspaceStore } from "@/lib/stores";

export default function WorkspaceSettingsScreen() {
  const { workspaceId } = useLocalSearchParams<{ workspaceId: string }>();
  const router = useRouter();
  const { workspaces } = useWorkspaces();
  const deleteWorkspace = useDeleteWorkspace();
  const workspace = workspaces.find((w) => w.workspaceId === workspaceId);

  function handleDelete() {
    Alert.alert(
      "Usuń workspace",
      "Czy na pewno chcesz usunąć ten workspace? Wszystkie dane zostaną utracone.",
      [
        { text: "Anuluj", style: "cancel" },
        {
          text: "Usuń",
          style: "destructive",
          onPress: async () => {
            await deleteWorkspace.mutateAsync(workspaceId!);
            const remaining = useWorkspaceStore.getState().workspaces;
            if (remaining.length === 0) {
              router.replace("/(app)/workspace-create" as never);
            } else {
              router.replace("/(app)/workspaces" as never);
            }
          },
        },
      ],
    );
  }

  if (!workspace) {
    return (
      <PageLayout>
        <Text className="text-on-surface-variant p-4">Workspace nie znaleziony.</Text>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <View className="gap-4 p-4 max-w-2xl w-full self-center">
        <Card className="p-4 gap-3">
          <Text className="text-on-surface font-headline text-lg">
            {workspace.workspaceName}
          </Text>
          <Text className="text-on-surface-variant font-body text-sm">
            ID: {workspace.workspaceId}
          </Text>
          <Text className="text-on-surface-variant font-body text-sm">
            Członkowie: {workspace.assignedUsers.length}
          </Text>
          <Text className="text-on-surface-variant font-body text-xs">
            Utworzono: {new Date(workspace.createdAt).toLocaleString("pl-PL")}
          </Text>
        </Card>

        <Card className="p-4 gap-2">
          <Text className="text-on-surface font-headline text-sm">
            Zarządzanie użytkownikami
          </Text>
          <Text className="text-on-surface-variant font-body text-xs">
            Przypisywanie użytkowników wymaga ich identyfikatorów UUID. Funkcja
            wyszukiwania użytkowników będzie dostępna w kolejnej wersji.
          </Text>
        </Card>

        <Button
          label="Usuń workspace"
          variant="error"
          loading={deleteWorkspace.isPending}
          onPress={handleDelete}
        />
      </View>
    </PageLayout>
  );
}
