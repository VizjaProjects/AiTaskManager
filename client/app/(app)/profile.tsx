import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Switch,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { PageLayout } from "@/components/organisms";
import { Button, Input, Card, Avatar } from "@/components/atoms";
import { useAuthStore, useThemeStore } from "@/lib/stores";
import { userApi } from "@/lib/api";
import {
  changePasswordSchema,
  changeFullNameSchema,
  type ChangePasswordFormData,
  type ChangeFullNameFormData,
} from "@/lib/schemas";

export default function ProfileScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= 1024;
  const { user, logout, setUser } = useAuthStore();
  const { mode, toggle, setMode } = useThemeStore();
  const [nameLoading, setNameLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [passSuccess, setPassSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
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
      await userApi.changePassword(data);
      setPassSuccess(true);
      passForm.reset();
      setTimeout(() => setPassSuccess(false), 3000);
    } catch (e: any) {
      setError(e.response?.data?.message ?? "Błąd zmiany hasła");
    } finally {
      setPassLoading(false);
    }
  }

  function handleDeleteAccount() {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna — wszystkie dane zostaną trwale usunięte.",
      );
      if (confirmed) performDeleteAccount();
    } else {
      Alert.alert(
        "Usuń konto",
        "Czy na pewno chcesz usunąć konto? Ta operacja jest nieodwracalna — wszystkie dane zostaną trwale usunięte.",
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

  const personalInfoCard = (
    <Card variant="surface">
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-on-surface font-headline text-base">
              Personal Information
            </Text>
            <Text className="text-on-surface-variant font-body text-xs mt-1">
              Update your personal details and how others see you.
            </Text>
          </View>
          {user && <Avatar fullName={user.fullName} size="lg" />}
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
        <View className="w-full">
          <Text className="text-on-surface-variant font-label text-xs uppercase tracking-widest mb-2">
            Email Address (read-only)
          </Text>
          <View className="flex-row items-center bg-surface-container-lowest rounded-xl h-12 px-4">
            <Text className="flex-1 text-on-surface-variant font-body text-base">
              {user?.email}
            </Text>
            <MaterialIcons name="lock" size={16} color="#777587" />
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <Button
            label="Save Changes"
            loading={nameLoading}
            onPress={nameForm.handleSubmit(handleNameChange)}
          />
          {nameSuccess && (
            <MaterialIcons name="check-circle" size={20} color="#10B981" />
          )}
        </View>
      </View>
    </Card>
  );

  const securityCard = (
    <Card variant="surface">
      <View className="gap-4">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="security" size={20} color="#4d41df" />
          <Text className="text-on-surface font-headline text-base">
            Security
          </Text>
        </View>
        <Controller
          control={passForm.control}
          name="oldPassword"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Current Password"
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
              secureTextEntry
              value={value}
              onChangeText={onChange}
              error={passForm.formState.errors.confirmPassword?.message}
            />
          )}
        />
        <View className="flex-row items-center gap-3">
          <Button
            variant="outline"
            label="Update Security Settings"
            loading={passLoading}
            onPress={passForm.handleSubmit(handlePasswordChange)}
          />
          {passSuccess && (
            <MaterialIcons name="check-circle" size={20} color="#10B981" />
          )}
        </View>
      </View>
    </Card>
  );

  const workspaceCard = (
    <Card variant="surface">
      <View className="gap-4">
        <View>
          <Text className="text-on-surface font-headline text-base">
            Workspace Preferences
          </Text>
          <Text className="text-on-surface-variant font-body text-xs mt-1">
            Customize your visual experience and automation triggers.
          </Text>
        </View>
        <TouchableOpacity className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center gap-3 flex-1 mr-3">
            <MaterialIcons
              name={mode === "dark" ? "dark-mode" : "light-mode"}
              size={22}
              color="#4d41df"
            />
            <View className="flex-1">
              <Text className="text-on-surface font-headline text-sm">
                Interface Theme
              </Text>
              <Text className="text-on-surface-variant font-body text-xs">
                Toggle between light and dark modes
              </Text>
            </View>
          </View>
          <View className="flex-row bg-surface-container-low rounded-full p-0.5 shrink-0">
            <TouchableOpacity
              onPress={() => setMode("light")}
              className={`px-3 py-1.5 rounded-full ${mode === "light" ? "bg-primary" : ""}`}
            >
              <Text
                className={`text-xs font-label ${mode === "light" ? "text-white" : "text-on-surface-variant"}`}
              >
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode("dark")}
              className={`px-3 py-1.5 rounded-full ${mode === "dark" ? "bg-primary" : ""}`}
            >
              <Text
                className={`text-xs font-label ${mode === "dark" ? "text-white" : "text-on-surface-variant"}`}
              >
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        <View className="flex-row items-center justify-between py-3">
          <View className="flex-row items-center gap-3 flex-1 mr-3">
            <MaterialIcons name="auto-awesome" size={22} color="#006b58" />
            <View className="flex-1">
              <Text className="text-on-surface font-headline text-sm">
                AI Smart Suggestions
              </Text>
              <Text className="text-on-surface-variant font-body text-xs">
                Allow AI to prioritize tasks based on deadlines
              </Text>
            </View>
          </View>
          <Switch
            value={true}
            trackColor={{ false: "#c7c4d8", true: "#006b58" }}
            thumbColor="#ffffff"
          />
        </View>
      </View>
    </Card>
  );

  const accountControlCard = (
    <Card variant="surface">
      <View className="gap-3">
        <Text className="text-primary font-label text-xs uppercase tracking-widest">
          Account Control
        </Text>
        <TouchableOpacity
          onPress={logout}
          className="flex-row items-center justify-between py-3"
        >
          <View className="flex-row items-center gap-3">
            <MaterialIcons name="logout" size={20} color="#777587" />
            <Text className="text-on-surface font-body text-sm">
              Logout Session
            </Text>
          </View>
          <MaterialIcons name="chevron-right" size={20} color="#777587" />
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center gap-3 py-2"
          onPress={handleDeleteAccount}
          disabled={deleteLoading}
        >
          <MaterialIcons name="delete-forever" size={20} color="#ba1a1a" />
          <Text className="text-error font-body text-sm">
            {deleteLoading ? "Usuwanie..." : "Deactivate Account"}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const supportCard = (
    <View className="bg-primary-fixed rounded-2xl p-6">
      <Text className="text-primary font-label text-xs uppercase tracking-widest mb-2">
        Need Help?
      </Text>
      <Text className="text-on-surface font-headline text-base mb-4">
        Questions about security or privacy?
      </Text>
      <TouchableOpacity className="border border-primary rounded-xl px-4 py-2.5 self-start">
        <Text className="text-primary font-headline text-sm">
          CONTACT SUPPORT →
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <PageLayout title="Account Settings">
      {error && (
        <View className="bg-error-container rounded-xl px-4 py-3 mb-4">
          <Text className="text-on-error-container font-body text-sm">
            {error}
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 24, paddingBottom: 64 }}
      >
        {isDesktop ? (
          <View className="flex-row gap-6">
            <View className="flex-1 gap-6">
              {personalInfoCard}
              {workspaceCard}
            </View>
            <View className="w-80 gap-6">
              {securityCard}
              {accountControlCard}
              {supportCard}
            </View>
          </View>
        ) : (
          <>
            {personalInfoCard}
            {securityCard}
            {workspaceCard}
            {accountControlCard}
            {supportCard}
          </>
        )}
      </ScrollView>
    </PageLayout>
  );
}
