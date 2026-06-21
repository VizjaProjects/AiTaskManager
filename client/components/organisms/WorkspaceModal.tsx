import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "../atoms";
import {
  useWorkspaces,
  useCreateWorkspace,
  useSetActiveWorkspace,
} from "@/lib/hooks";
import { useWorkspaceStore } from "@/lib/stores";
import type { Workspace, WorkspaceVisibility } from "@/lib/types";

const createSchema = z.object({
  workspaceName: z.string().min(2, "Name must be at least 2 characters"),
});

type CreateForm = z.infer<typeof createSchema>;

function SectionLabel({
  icon,
  label,
  count,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  count: number;
}) {
  return (
    <View className="flex-row items-center gap-1.5 px-1">
      <MaterialIcons name={icon} size={13} color="#9b9791" />
      <Text className="text-text-tertiary font-label text-[10px] uppercase tracking-widest">
        {label}
      </Text>
      <Text className="text-text-tertiary font-body text-[10px]">· {count}</Text>
    </View>
  );
}

function WorkspaceRow({
  ws,
  isActive,
  onSelect,
  onManage,
}: {
  ws: Workspace;
  isActive: boolean;
  onSelect: () => void;
  onManage: () => void;
}) {
  const isPublic = ws.visibility === "Public";
  return (
    <View
      className={`flex-row items-center gap-2 p-2 pl-4 rounded-xl border border-outline-variant ${
        isActive ? "bg-surface-container-low" : "bg-surface-container-lowest"
      }`}
    >
      <TouchableOpacity
        onPress={onSelect}
        className="flex-row items-center gap-3 flex-1 min-w-0 py-2"
      >
        <View
          className={`w-9 h-9 rounded-lg items-center justify-center ${
            isActive ? "bg-inverse-surface" : "bg-surface-container-low"
          }`}
        >
          <MaterialIcons
            name={isPublic ? "group" : "lock"}
            size={18}
            color={isActive ? "#ffffff" : "#9b9791"}
          />
        </View>
        <View className="flex-1 min-w-0">
          <Text
            className="text-on-surface font-headline text-body-md"
            numberOfLines={1}
          >
            {ws.workspaceName}
          </Text>
          <Text className="text-on-surface-variant font-body text-xs mt-0.5">
            {ws.assignedUsers.length} member
            {ws.assignedUsers.length !== 1 ? "s" : ""}
          </Text>
        </View>
        {isActive && (
          <MaterialIcons name="check-circle" size={20} color="#111111" />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onManage}
        className="w-9 h-9 items-center justify-center rounded-lg"
        accessibilityLabel="Workspace settings"
      >
        <MaterialIcons name="settings" size={20} color="#9b9791" />
      </TouchableOpacity>
    </View>
  );
}

interface WorkspaceModalProps {
  visible: boolean;
  onClose: () => void;
  onSelected?: () => void;
}

export function WorkspaceModal({
  visible,
  onClose,
  onSelected,
}: WorkspaceModalProps) {
  const router = useRouter();
  const { workspaces, isLoading } = useWorkspaces();
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const setActive = useSetActiveWorkspace();
  const createWorkspace = useCreateWorkspace();
  const [mode, setMode] = useState<"list" | "create">("list");
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<WorkspaceVisibility>("Private");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
    defaultValues: { workspaceName: "" },
  });

  function handleClose() {
    setMode("list");
    setError(null);
    setVisibility("Private");
    reset();
    onClose();
  }

  function selectWorkspace(id: string) {
    setActive.mutate(id, {
      onSuccess: () => {
        handleClose();
        onSelected?.();
      },
    });
  }

  function manageMembers(id: string) {
    handleClose();
    router.push({
      pathname: "/(app)/workspace-settings",
      params: { workspaceId: id },
    } as never);
  }

  async function onCreate(data: CreateForm) {
    setError(null);
    try {
      await createWorkspace.mutateAsync({
        name: data.workspaceName,
        visibility,
      });
      reset();
      setVisibility("Private");
      setMode("list");
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { title?: string } };
        message?: string;
      };
      setError(
        err.response?.data?.title ??
          err.message ??
          "Could not create workspace",
      );
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/40 items-center justify-center p-6"
        onPress={handleClose}
      >
        <Pressable
          className="bg-surface-container-lowest rounded-2xl w-full max-w-md border border-outline-variant overflow-hidden"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
            <View className="flex-row items-center gap-2">
              {mode === "create" && (
                <TouchableOpacity
                  onPress={() => {
                    setMode("list");
                    setError(null);
                  }}
                >
                  <MaterialIcons name="arrow-back" size={22} color="#9b9791" />
                </TouchableOpacity>
              )}
              <Text className="text-on-surface font-headline text-title-lg">
                {mode === "list" ? "Workspaces" : "New Workspace"}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <MaterialIcons name="close" size={22} color="#9b9791" />
            </TouchableOpacity>
          </View>

          {mode === "list" ? (
            <View className="px-5 pb-5">
              <Text className="text-on-surface-variant font-body text-body-md mb-4">
                Switch between your workspaces or create a new one.
              </Text>

              {isLoading ? (
                <Text className="text-on-surface-variant font-body text-sm py-6 text-center">
                  Loading...
                </Text>
              ) : workspaces.length === 0 ? (
                <View className="items-center py-8 gap-3">
                  <View className="w-12 h-12 rounded-xl bg-surface-container-low items-center justify-center">
                    <MaterialIcons
                      name="workspaces"
                      size={24}
                      color="#9b9791"
                    />
                  </View>
                  <Text className="text-on-surface-variant font-body text-body-md text-center">
                    No workspaces yet. Create your first one to get started.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  style={{ maxHeight: 320 }}
                  showsVerticalScrollIndicator={false}
                >
                  <View className="gap-4">
                    {workspaces.some((w) => w.visibility === "Public") && (
                      <View className="gap-2">
                        <SectionLabel
                          icon="group"
                          label="Public"
                          count={
                            workspaces.filter((w) => w.visibility === "Public")
                              .length
                          }
                        />
                        {workspaces
                          .filter((w) => w.visibility === "Public")
                          .map((ws) => (
                            <WorkspaceRow
                              key={ws.workspaceId}
                              ws={ws}
                              isActive={ws.workspaceId === activeWorkspaceId}
                              onSelect={() => selectWorkspace(ws.workspaceId)}
                              onManage={() => manageMembers(ws.workspaceId)}
                            />
                          ))}
                      </View>
                    )}
                    {workspaces.some((w) => w.visibility !== "Public") && (
                      <View className="gap-2">
                        <SectionLabel
                          icon="lock"
                          label="Private"
                          count={
                            workspaces.filter((w) => w.visibility !== "Public")
                              .length
                          }
                        />
                        {workspaces
                          .filter((w) => w.visibility !== "Public")
                          .map((ws) => (
                            <WorkspaceRow
                              key={ws.workspaceId}
                              ws={ws}
                              isActive={ws.workspaceId === activeWorkspaceId}
                              onSelect={() => selectWorkspace(ws.workspaceId)}
                              onManage={() => manageMembers(ws.workspaceId)}
                            />
                          ))}
                      </View>
                    )}
                  </View>
                </ScrollView>
              )}

              <TouchableOpacity
                onPress={() => setMode("create")}
                className="flex-row items-center justify-center gap-2 mt-4 py-3.5 rounded-xl bg-inverse-surface"
              >
                <MaterialIcons name="add" size={20} color="#ffffff" />
                <Text className="text-inverse-on-surface font-headline text-sm">
                  Create Workspace
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="px-5 pb-5 gap-4">
              <Text className="text-on-surface-variant font-body text-body-md">
                A workspace groups your tasks, calendar, and team settings.
              </Text>
              {error && (
                <View className="bg-error-container rounded-xl px-4 py-3">
                  <Text className="text-on-error-container font-body text-sm">
                    {error}
                  </Text>
                </View>
              )}
              <Controller
                control={control}
                name="workspaceName"
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Workspace name"
                    placeholder="e.g. My Team"
                    value={value}
                    onChangeText={onChange}
                    error={errors.workspaceName?.message}
                    autoFocus
                  />
                )}
              />

              <View className="gap-2">
                <Text className="text-on-surface font-label text-body-md">
                  Visibility
                </Text>
                {(
                  [
                    {
                      key: "Private",
                      icon: "lock",
                      title: "Private",
                      desc: "Only you. Members can't be added.",
                    },
                    {
                      key: "Public",
                      icon: "group",
                      title: "Public",
                      desc: "Invite and assign members.",
                    },
                  ] as {
                    key: WorkspaceVisibility;
                    icon: keyof typeof MaterialIcons.glyphMap;
                    title: string;
                    desc: string;
                  }[]
                ).map((opt) => {
                  const selected = visibility === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      onPress={() => setVisibility(opt.key)}
                      className={`flex-row items-center gap-3 rounded-md border px-4 py-3 ${
                        selected
                          ? "border-accent bg-surface-container-low"
                          : "border-outline-variant"
                      }`}
                    >
                      <MaterialIcons
                        name={opt.icon}
                        size={20}
                        color={selected ? "#5b4ee0" : "#6b6965"}
                      />
                      <View className="flex-1 min-w-0">
                        <Text className="text-on-surface font-body text-body-md">
                          {opt.title}
                        </Text>
                        <Text className="text-on-surface-variant font-body text-xs">
                          {opt.desc}
                        </Text>
                      </View>
                      <MaterialIcons
                        name={
                          selected
                            ? "radio-button-checked"
                            : "radio-button-unchecked"
                        }
                        size={20}
                        color={selected ? "#5b4ee0" : "#9b9791"}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Button
                label="Create Workspace"
                fullWidth
                loading={createWorkspace.isPending}
                onPress={handleSubmit(onCreate)}
              />
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
