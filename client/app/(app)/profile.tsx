import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/organisms";
import { LlmSettingsPanel } from "@/components/organisms/LlmSettingsPanel";
import { Button, Input, Card, Avatar } from "@/components/atoms";
import { useAuthStore, useThemeStore } from "@/lib/stores";
import { useWorkspaceStore } from "@/lib/stores";
import { identityApi, userApi } from "@/lib/api";
import {
  changePasswordSchema,
  changeFullNameSchema,
  type ChangePasswordFormData,
  type ChangeFullNameFormData,
} from "@/lib/schemas";
import { useT } from "@/lib/i18n";

type SettingsTab = "account" | "ai";

const TABS: {
  id: SettingsTab;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { id: "account", label: "profile.tabAccount", icon: "person" },
  { id: "ai", label: "profile.tabAi", icon: "psychology" },
];

function isSettingsTab(value: string | undefined): value is SettingsTab {
  return value === "account" || value === "ai";
}

export default function ProfileScreen() {
  const router = useRouter();
  const t = useT();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { user, setUser, logout } = useAuthStore();
  const { mode } = useThemeStore();
  const workspaces = useWorkspaceStore((s) => s.workspaces);
  const defaultWorkspaceId = useWorkspaceStore((s) => s.defaultWorkspaceId);
  const setDefaultWorkspace = useWorkspaceStore((s) => s.setDefaultWorkspace);
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [defaultWsLoading, setDefaultWsLoading] = useState<string | null>(null);

  async function handleSetDefaultWorkspace(id: string) {
    if (id === defaultWorkspaceId) return;
    setDefaultWsLoading(id);
    setError(null);
    try {
      await setDefaultWorkspace(id);
    } catch (e: any) {
      setError(
        e.response?.data?.message ?? t("profile.errSetDefaultWs"),
      );
    } finally {
      setDefaultWsLoading(null);
    }
  }

  useEffect(() => {
    if (isSettingsTab(params.tab)) {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

  function selectTab(tab: SettingsTab) {
    setActiveTab(tab);
    router.setParams({ tab });
  }

  const nameForm = useForm<ChangeFullNameFormData>({
    resolver: zodResolver(changeFullNameSchema),
    defaultValues: { newFullName: user?.fullName ?? "" },
  });

  const passForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { oldPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function handleNameChange(data: ChangeFullNameFormData) {
    setNameLoading(true);
    setError(null);
    try {
      await userApi.changeFullName(data);
      if (user) setUser({ ...user, fullName: data.newFullName });
    } catch (e: any) {
      setError(e.response?.data?.message ?? t("profile.errNameChange"));
    } finally {
      setNameLoading(false);
    }
  }

  async function handlePasswordChange(data: ChangePasswordFormData) {
    setPassLoading(true);
    setError(null);
    try {
      await identityApi.changePassword(data.oldPassword, data.newPassword);
      passForm.reset();
    } catch (e: any) {
      setError(e.response?.data?.message ?? t("profile.errPassChange"));
    } finally {
      setPassLoading(false);
    }
  }

  function handleDeleteAccount() {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(t("profile.deleteConfirm"));
      if (confirmed) performDeleteAccount();
    } else {
      Alert.alert(
        t("profile.deleteAccount"),
        t("profile.deleteConfirm"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("common.delete"),
            style: "destructive",
            onPress: performDeleteAccount,
          },
        ],
      );
    }
  }

  async function performDeleteAccount() {
    setDeleteLoading(true);
    try {
      await userApi.deleteAccount();
      logout();
    } catch (e: any) {
      setError(e.response?.data?.message ?? t("profile.errDelete"));
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <PageLayout showSearch={false}>
      <View className="flex-1 items-center w-full">
        {error && (
          <View className="bg-error-container rounded-xl px-4 py-3 mb-4 w-full max-w-2xl">
            <Text className="text-on-error-container font-body text-sm">
              {error}
            </Text>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="w-full max-w-2xl"
          contentContainerStyle={{ gap: 20, paddingBottom: 64 }}
        >
          <View>
            <Text className="text-on-surface font-headline text-headline-md">
              {t("profile.title")}
            </Text>
            <Text className="text-on-surface-variant font-body text-body-md mt-1">
              {t("profile.subtitle")}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2 bg-surface-container-low rounded-full p-1 self-start">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => selectTab(tab.id)}
                  className={`flex-row items-center gap-1.5 px-4 py-2.5 rounded-full ${
                    active ? "bg-primary" : ""
                  }`}
                >
                  <MaterialIcons
                    name={tab.icon}
                    size={16}
                    color={
                      active
                        ? mode === "dark"
                          ? "#121212"
                          : "#ffffff"
                        : "#6b6965"
                    }
                  />
                  <Text
                    className={`text-sm font-label ${
                      active ? "text-on-primary" : "text-on-surface-variant"
                    }`}
                  >
                    {t(tab.label)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {activeTab === "account" && (
            <View className="gap-5">
              <Card variant="elevated">
                <View className="flex-row items-center gap-4 mb-6">
                  {user && <Avatar fullName={user.fullName} size="lg" />}
                  <View className="flex-1">
                    <Text className="text-on-surface font-headline text-title-lg">
                      {user?.fullName}
                    </Text>
                    <Text className="text-on-surface-variant font-body text-body-md">
                      {user?.email}
                    </Text>
                  </View>
                </View>

                <Controller
                  control={nameForm.control}
                  name="newFullName"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label={t("profile.fullName")}
                      value={value}
                      onChangeText={onChange}
                      error={nameForm.formState.errors.newFullName?.message}
                    />
                  )}
                />
                <View className="mt-4">
                  <Button
                    label={t("profile.saveChanges")}
                    loading={nameLoading}
                    onPress={nameForm.handleSubmit(handleNameChange)}
                  />
                </View>
              </Card>

              {workspaces.length > 0 && (
                <Card variant="elevated">
                  <Text className="text-on-surface font-headline text-title-lg mb-1">
                    {t("profile.defaultWorkspace")}
                  </Text>
                  <Text className="text-on-surface-variant font-body text-body-md mb-4">
                    {t("profile.defaultWorkspaceDesc")}
                  </Text>
                  <View className="gap-2">
                    {workspaces.map((ws) => {
                      const isDefault = ws.workspaceId === defaultWorkspaceId;
                      const loading = defaultWsLoading === ws.workspaceId;
                      return (
                        <TouchableOpacity
                          key={ws.workspaceId}
                          disabled={loading || isDefault}
                          onPress={() =>
                            handleSetDefaultWorkspace(ws.workspaceId)
                          }
                          className={`flex-row items-center justify-between gap-3 rounded-md border px-4 py-3 ${
                            isDefault
                              ? "border-primary bg-surface-container-low"
                              : "border-outline-variant"
                          }`}
                        >
                          <View className="flex-row items-center gap-3 flex-1 min-w-0">
                            <MaterialIcons
                              name="workspaces"
                              size={18}
                              color={mode === "dark" ? "#a0a0a5" : "#6b6965"}
                            />
                            <Text
                              className="text-on-surface font-body text-body-md flex-1"
                              numberOfLines={1}
                            >
                              {ws.workspaceName}
                            </Text>
                          </View>
                          <MaterialIcons
                            name={
                              isDefault
                                ? "radio-button-checked"
                                : "radio-button-unchecked"
                            }
                            size={20}
                            color={
                              isDefault
                                ? "#5b4ee0"
                                : mode === "dark"
                                  ? "#5c5c60"
                                  : "#9b9791"
                            }
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Card>
              )}

              <Card variant="elevated">
                <Text className="text-on-surface font-headline text-title-lg mb-1">
                  {t("profile.changePassword")}
                </Text>
                <Text className="text-on-surface-variant font-body text-body-md mb-4">
                  {t("profile.changePasswordDesc")}
                </Text>

                <View className="gap-4">
                  <Controller
                    control={passForm.control}
                    name="oldPassword"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label={t("profile.currentPassword")}
                        secureToggle
                        secureTextEntry
                        value={value}
                        onChangeText={onChange}
                        error={passForm.formState.errors.oldPassword?.message}
                      />
                    )}
                  />
                  <Controller
                    control={passForm.control}
                    name="newPassword"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label={t("profile.newPassword")}
                        secureToggle
                        secureTextEntry
                        value={value}
                        onChangeText={onChange}
                        error={passForm.formState.errors.newPassword?.message}
                      />
                    )}
                  />
                  <Controller
                    control={passForm.control}
                    name="confirmPassword"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label={t("profile.confirmNewPassword")}
                        secureToggle
                        secureTextEntry
                        value={value}
                        onChangeText={onChange}
                        error={
                          passForm.formState.errors.confirmPassword?.message
                        }
                      />
                    )}
                  />
                </View>
                <View className="mt-4">
                  <Button
                    variant="outline"
                    label={t("profile.updatePassword")}
                    loading={passLoading}
                    onPress={passForm.handleSubmit(handlePasswordChange)}
                  />
                </View>
              </Card>

              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-row items-center justify-center gap-2 rounded-xl py-3.5"
              >
                <MaterialIcons
                  name="delete-outline"
                  size={16}
                  color="#ba1a1a"
                />
                <Text className="text-error font-body text-sm">
                  {deleteLoading ? t("profile.deleting") : t("profile.deleteAccount")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "ai" && <LlmSettingsPanel />}
        </ScrollView>
      </View>
    </PageLayout>
  );
}
