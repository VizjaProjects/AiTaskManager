import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Redirect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms/PageLayout";
import { Card } from "@/components/atoms/Card";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { useAuthStore, useThemeStore } from "@/lib/stores";
import { Role } from "@/lib/types";
import type { Plan } from "@/lib/types";
import { useAdminPlans, useCreatePlan } from "@/lib/hooks";
import { getUiTokens } from "@/lib/utils/uiTokens";

function PlanTile({ plan }: { plan: Plan }) {
  return (
    <Card variant="elevated" className="flex-1 min-w-[260px] gap-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-on-surface font-display text-2xl">
          {plan.planName}
        </Text>
        <View
          className={`px-3 py-1 rounded-full ${
            plan.isActive ? "bg-success/15" : "bg-outline/15"
          }`}
        >
          <Text
            className={`font-label text-[10px] uppercase tracking-widest ${
              plan.isActive ? "text-[#2E7D52]" : "text-text-tertiary"
            }`}
          >
            {plan.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>

      <View className="gap-3">
        <LimitRow
          icon="auto-awesome"
          label="AI calls / day"
          value={plan.aiTaskLimit}
        />
        <View className="h-px bg-border-subtle" />
        <LimitRow
          icon="public"
          label="Public workspaces"
          value={plan.publicWorkspaceLimit}
        />
        <View className="h-px bg-border-subtle" />
        <LimitRow
          icon="lock"
          label="Private workspaces"
          value={plan.privateWorkspaceLimit}
        />
      </View>
    </Card>
  );
}

function LimitRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: number;
}) {
  const ui = getUiTokens(useThemeStore((s) => s.mode === "dark"));
  return (
    <View className="flex-row items-center gap-3">
      <MaterialIcons name={icon} size={16} color={ui.textSecondary} />
      <Text className="flex-1 font-body text-body-md text-on-surface-variant">
        {label}
      </Text>
      <Text className="font-headline text-title-lg text-on-surface">
        {value}
      </Text>
    </View>
  );
}

type FormState = {
  planName: string;
  aiTaskLimit: string;
  publicWorkspaceLimit: string;
  privateWorkspaceLimit: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  planName: "",
  aiTaskLimit: "",
  publicWorkspaceLimit: "",
  privateWorkspaceLimit: "",
  isActive: true,
};

function CreatePlanForm({ onClose }: { onClose: () => void }) {
  const createPlan = useCreatePlan();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toInt(value: string): number | null {
    if (value.trim() === "") return null;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
  }

  async function submit() {
    setError(null);
    const ai = toInt(form.aiTaskLimit);
    const pub = toInt(form.publicWorkspaceLimit);
    const priv = toInt(form.privateWorkspaceLimit);

    if (!form.planName.trim()) return setError("Plan name is required.");
    if (ai === null || pub === null || priv === null)
      return setError("All limits must be non-negative numbers.");

    try {
      await createPlan.mutateAsync({
        planName: form.planName.trim(),
        aiTaskLimit: ai,
        publicWorkspaceLimit: pub,
        privateWorkspaceLimit: priv,
        isActive: form.isActive,
      });
      setForm(EMPTY_FORM);
      onClose();
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? "Could not create the plan.";
      setError(message);
    }
  }

  return (
    <Card variant="elevated" className="gap-4">
      <Text className="text-on-surface font-headline text-title-lg">
        New plan
      </Text>

      {error ? (
        <View className="bg-error-container rounded-xl px-4 py-3">
          <Text className="text-on-error-container font-body text-sm">
            {error}
          </Text>
        </View>
      ) : null}

      <Input
        label="Plan name"
        placeholder="e.g. Pro"
        value={form.planName}
        onChangeText={(v) => set("planName", v)}
      />

      <View className="flex-row gap-3 flex-wrap">
        <View className="flex-1 min-w-[140px]">
          <Input
            label="AI calls / day"
            placeholder="100"
            keyboardType="numeric"
            value={form.aiTaskLimit}
            onChangeText={(v) => set("aiTaskLimit", v)}
          />
        </View>
        <View className="flex-1 min-w-[140px]">
          <Input
            label="Public workspaces"
            placeholder="5"
            keyboardType="numeric"
            value={form.publicWorkspaceLimit}
            onChangeText={(v) => set("publicWorkspaceLimit", v)}
          />
        </View>
        <View className="flex-1 min-w-[140px]">
          <Input
            label="Private workspaces"
            placeholder="3"
            keyboardType="numeric"
            value={form.privateWorkspaceLimit}
            onChangeText={(v) => set("privateWorkspaceLimit", v)}
          />
        </View>
      </View>

      <TouchableOpacity
        onPress={() => set("isActive", !form.isActive)}
        activeOpacity={0.8}
        className="flex-row items-center gap-3"
      >
        <View
          className={`w-5 h-5 rounded-md items-center justify-center border ${
            form.isActive
              ? "bg-accent border-accent"
              : "bg-surface border-outline"
          }`}
        >
          {form.isActive && (
            <MaterialIcons name="check" size={14} color="#ffffff" />
          )}
        </View>
        <Text className="font-body text-body-md text-on-surface">
          Active (available to users)
        </Text>
      </TouchableOpacity>

      <View className="flex-row gap-3 justify-end">
        <Button variant="outline" label="Cancel" onPress={onClose} />
        <Button
          variant="primary"
          label="Create plan"
          loading={createPlan.isPending}
          onPress={submit}
        />
      </View>
    </Card>
  );
}

export default function AdminPlansScreen() {
  const user = useAuthStore((s) => s.user);
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 768;
  const { data: plans = [], isLoading, refetch } = useAdminPlans();
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const sorted = useMemo(
    () => [...plans].sort((a, b) => Number(b.isActive) - Number(a.isActive)),
    [plans],
  );

  if (!user) {
    return null;
  }

  if (user.role !== Role.ADMIN) {
    return <Redirect href="/(app)/dashboard" />;
  }

  async function onRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  return (
    <PageLayout showSearch={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="flex-row items-start justify-between gap-4">
          <View className="flex-1">
            <Text className="text-on-surface font-display text-headline-lg">
              Plans
            </Text>
            <Text className="text-on-surface-variant font-body text-body-lg mt-1">
              Subscription tiers and their limits.
            </Text>
          </View>
          {!showForm && (
            <Button
              variant="primary"
              icon="add"
              label="New plan"
              onPress={() => setShowForm(true)}
            />
          )}
        </View>

        {showForm && <CreatePlanForm onClose={() => setShowForm(false)} />}

        {isLoading ? (
          <Text className="text-on-surface-variant font-body text-sm py-8 text-center">
            Loading...
          </Text>
        ) : sorted.length === 0 ? (
          <Card variant="elevated" className="items-center py-10 gap-2">
            <MaterialIcons name="workspaces" size={28} color="#9b9791" />
            <Text className="text-on-surface font-headline text-title-lg">
              No plans yet
            </Text>
            <Text className="text-on-surface-variant font-body text-body-md text-center">
              Create the first plan to start assigning limits.
            </Text>
          </Card>
        ) : (
          <View
            className={`gap-4 ${isWide ? "flex-row flex-wrap" : "flex-col"}`}
          >
            {sorted.map((plan) => (
              <PlanTile key={plan.planId} plan={plan} />
            ))}
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
}
