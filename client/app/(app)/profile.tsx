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
import { identityApi, userApi } from "@/lib/api";
import {
  changePasswordSchema,
  changeFullNameSchema,
  type ChangePasswordFormData,
  type ChangeFullNameFormData,
} from "@/lib/schemas";

type SettingsTab = "account" | "appearance" | "ai";

const TABS: { id: SettingsTab; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] =
  [
    { id: "account", label: "Account", icon: "person" },
    { id: "appearance", label: "Appearance", icon: "palette" },
    { id: "ai", label: "AI Personal", icon: "psychology" },
  ];

function isSettingsTab(value: string | undefined): value is SettingsTab {
  return value === "account" || value === "appearance" || value === "ai";
}

export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { user, setUser, logout } = useAuthStore();
  const { mode, setMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      setError(e.response?.data?.message ?? "Błąd zmiany imienia");
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
      setError(e.response?.data?.message ?? "Błąd zmiany hasła");
    } finally {
      setPassLoading(false);
    }
  }

  function handleDeleteAccount() {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna.",
      );
      if (confirmed) performDeleteAccount();
    } else {
      Alert.alert(
        "Usuń konto",
        "Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna.",
        [
          { text: "Anuluj", style: "cancel" },
          { text: "Usuń", style: "destructive", onPress: performDeleteAccount },
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
      setError(e.response?.data?.message ?? "Błąd usuwania konta");
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
              Settings
            </Text>
            <Text className="text-on-surface-variant font-body text-body-md mt-1">
              Manage your profile, appearance, and personal AI configurations.
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
                    color={active ? "#ffffff" : "#777587"}
                  />
                  <Text
                    className={`text-sm font-label ${
                      active ? "text-white" : "text-on-surface-variant"
                    }`}
                  >
                    {tab.label}
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
                      label="Full Name"
                      value={value}
                      onChangeText={onChange}
                      error={nameForm.formState.errors.newFullName?.message}
                    />
                  )}
                />
                <View className="mt-4">
                  <Button
                    label="Save Changes"
                    loading={nameLoading}
                    onPress={nameForm.handleSubmit(handleNameChange)}
                  />
                </View>
              </Card>

              <Card variant="elevated">
                <Text className="text-on-surface font-headline text-title-lg mb-1">
                  Change Password
                </Text>
                <Text className="text-on-surface-variant font-body text-body-md mb-4">
                  Update your password to keep your account secure.
                </Text>

                <View className="gap-4">
                  <Controller
                    control={passForm.control}
                    name="oldPassword"
                    render={({ field: { onChange, value } }) => (
                      <Input
                        label="Current Password"
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
                        label="New Password"
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
                        label="Confirm New Password"
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
                    label="Update Password"
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
                <MaterialIcons name="delete-outline" size={16} color="#ba1a1a" />
                <Text className="text-error font-body text-sm">
                  {deleteLoading ? "Deleting account..." : "Delete account"}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeTab === "appearance" && (
            <Card variant="elevated">
              <Text className="text-on-surface font-headline text-title-lg mb-4">
                Appearance
              </Text>
              <View className="flex-row bg-surface-container-low rounded-full p-1 self-start">
                <TouchableOpacity
                  onPress={() => setMode("light")}
                  className={`px-5 py-2 rounded-full ${mode === "light" ? "bg-primary" : ""}`}
                >
                  <Text
                    className={`text-sm font-label ${mode === "light" ? "text-white" : "text-on-surface-variant"}`}
                  >
                    Light
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setMode("dark")}
                  className={`px-5 py-2 rounded-full ${mode === "dark" ? "bg-primary" : ""}`}
                >
                  <Text
                    className={`text-sm font-label ${mode === "dark" ? "text-white" : "text-on-surface-variant"}`}
                  >
                    Dark
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {activeTab === "ai" && <LlmSettingsPanel />}
        </ScrollView>
      </View>
    </PageLayout>
  );
}
