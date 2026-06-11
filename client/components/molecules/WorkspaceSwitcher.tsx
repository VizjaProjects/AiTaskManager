import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useWorkspaceStore } from "@/lib/stores";
import { WorkspaceModal } from "../organisms/WorkspaceModal";

export function WorkspaceSwitcher({ onSelected }: { onSelected?: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const getActiveWorkspace = useWorkspaceStore((s) => s.getActiveWorkspace);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const workspace = getActiveWorkspace();

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalOpen(true)}
        className="flex-row items-center gap-3 px-3 py-2.5 mx-1 mb-2 rounded-xl bg-surface-container-low"
        activeOpacity={0.8}
      >
        <View className="w-8 h-8 rounded-lg bg-inverse-surface items-center justify-center">
          <MaterialIcons name="workspaces" size={16} color="#ffffff" />
        </View>
        <View className="flex-1 min-w-0">
          <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-wide">
            Workspace
          </Text>
          <Text
            className="text-on-surface font-headline text-sm"
            numberOfLines={1}
          >
            {workspace?.workspaceName ??
              (activeWorkspaceId ? "Loading..." : "Select workspace")}
          </Text>
        </View>
        <MaterialIcons name="unfold-more" size={18} color="#888888" />
      </TouchableOpacity>
      <WorkspaceModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelected={onSelected}
      />
    </>
  );
}
