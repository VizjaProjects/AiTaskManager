import { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Redirect } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { PageLayout } from "@/components/organisms/PageLayout";
import { Card } from "@/components/atoms/Card";
import { Avatar } from "@/components/atoms/Avatar";
import { PlanUsageBar } from "@/components/molecules/PlanUsageBar";
import { useAuthStore } from "@/lib/stores";
import { Role } from "@/lib/types";
import type { AdminUser } from "@/lib/types";
import { useAdminUsers } from "@/lib/hooks";

function PlanPill({ user }: { user: AdminUser }) {
  if (!user.planName) {
    return (
      <View className="px-2.5 py-0.5 rounded-full bg-outline/15 self-start">
        <Text className="font-label text-[10px] uppercase tracking-wider text-text-tertiary">
          No plan
        </Text>
      </View>
    );
  }
  return (
    <View
      className={`px-2.5 py-0.5 rounded-full self-start ${
        user.planIsActive ? "bg-accent/10" : "bg-outline/15"
      }`}
    >
      <Text
        className={`font-label text-[10px] uppercase tracking-wider ${
          user.planIsActive ? "text-accent" : "text-text-tertiary"
        }`}
      >
        {user.planName}
      </Text>
    </View>
  );
}

function UsageCell({ used, limit }: { used: number; limit: number }) {
  const reached = limit > 0 && used >= limit;
  return (
    <Text
      className="font-headline text-body-md"
      style={{ color: reached ? "#C0392B" : undefined }}
    >
      <Text style={{ color: reached ? "#C0392B" : undefined }}>{used}</Text>
      <Text className="text-text-tertiary font-body">/{limit}</Text>
    </Text>
  );
}

/* ───── Desktop table ───── */

function TableHeader() {
  const cols = ["User", "Plan", "AI / day", "Public WS", "Private WS"];
  const widths = [3, 2, 1.4, 1.4, 1.4];
  return (
    <View className="flex-row items-center px-4 py-3 border-b border-outline-variant">
      {cols.map((c, i) => (
        <View key={c} style={{ flex: widths[i] }}>
          <Text className="font-label text-[10px] uppercase tracking-widest text-text-tertiary">
            {c}
          </Text>
        </View>
      ))}
    </View>
  );
}

function TableRow({ user, last }: { user: AdminUser; last: boolean }) {
  return (
    <View
      className={`flex-row items-center px-4 py-3 ${
        last ? "" : "border-b border-border-subtle"
      }`}
    >
      <View style={{ flex: 3 }} className="flex-row items-center gap-3 pr-3">
        <Avatar fullName={user.fullName} size="sm" />
        <View className="flex-1 min-w-0">
          <Text
            className="font-headline text-body-md text-on-surface"
            numberOfLines={1}
          >
            {user.fullName}
          </Text>
          <Text
            className="font-body text-xs text-on-surface-variant"
            numberOfLines={1}
          >
            {user.email}
          </Text>
        </View>
      </View>
      <View style={{ flex: 2 }} className="pr-3">
        <PlanPill user={user} />
      </View>
      <View style={{ flex: 1.4 }}>
        <UsageCell used={user.aiTaskUsage} limit={user.aiTaskLimit} />
      </View>
      <View style={{ flex: 1.4 }}>
        <UsageCell
          used={user.publicWorkspaceUsage}
          limit={user.publicWorkspaceLimit}
        />
      </View>
      <View style={{ flex: 1.4 }}>
        <UsageCell
          used={user.privateWorkspaceUsage}
          limit={user.privateWorkspaceLimit}
        />
      </View>
    </View>
  );
}

/* ───── Mobile card ───── */

function UserCard({ user }: { user: AdminUser }) {
  return (
    <Card variant="elevated" className="gap-3">
      <View className="flex-row items-center gap-3">
        <Avatar fullName={user.fullName} size="md" />
        <View className="flex-1 min-w-0">
          <Text
            className="font-headline text-body-lg text-on-surface"
            numberOfLines={1}
          >
            {user.fullName}
          </Text>
          <Text
            className="font-body text-xs text-on-surface-variant"
            numberOfLines={1}
          >
            {user.email}
          </Text>
        </View>
        <PlanPill user={user} />
      </View>
      <View className="h-px bg-border-subtle" />
      <View className="gap-3">
        <PlanUsageBar
          icon="auto-awesome"
          label="AI calls / day"
          used={user.aiTaskUsage}
          limit={user.aiTaskLimit}
          compact
        />
        <PlanUsageBar
          icon="public"
          label="Public workspaces"
          used={user.publicWorkspaceUsage}
          limit={user.publicWorkspaceLimit}
          compact
        />
        <PlanUsageBar
          icon="lock"
          label="Private workspaces"
          used={user.privateWorkspaceUsage}
          limit={user.privateWorkspaceLimit}
          compact
        />
      </View>
    </Card>
  );
}

export default function AdminUsersScreen() {
  const user = useAuthStore((s) => s.user);
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" && width >= 1024;
  const { data: users = [], isLoading, refetch } = useAdminUsers();
  const [refreshing, setRefreshing] = useState(false);

  const sorted = useMemo(
    () => [...users].sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [users],
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
        <View>
          <Text className="text-on-surface font-display text-headline-lg">
            Users
          </Text>
          <Text className="text-on-surface-variant font-body text-body-lg mt-1">
            Every account, its plan, and current usage.
          </Text>
        </View>

        {isLoading ? (
          <Text className="text-on-surface-variant font-body text-sm py-8 text-center">
            Loading...
          </Text>
        ) : sorted.length === 0 ? (
          <Card variant="elevated" className="items-center py-10 gap-2">
            <MaterialIcons name="group" size={28} color="#9b9791" />
            <Text className="text-on-surface font-headline text-title-lg">
              No users found
            </Text>
          </Card>
        ) : isWide ? (
          <Card variant="elevated" className="p-0 overflow-hidden">
            <TableHeader />
            {sorted.map((u, i) => (
              <TableRow
                key={u.userId}
                user={u}
                last={i === sorted.length - 1}
              />
            ))}
          </Card>
        ) : (
          <View className="gap-4">
            {sorted.map((u) => (
              <UserCard key={u.userId} user={u} />
            ))}
          </View>
        )}
      </ScrollView>
    </PageLayout>
  );
}
