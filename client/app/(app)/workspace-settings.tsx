import {
  View,
  Text,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PageLayout } from "@/components/organisms";
import { Button, Card, Input, Avatar } from "@/components/atoms";
import {
  useWorkspaces,
  useDeleteWorkspace,
  useAssignWorkspaceUsersByEmail,
  useRemoveWorkspaceUsers,
  useSetWorkspaceVisibility,
} from "@/lib/hooks";
import { useWorkspaceStore, useAuthStore } from "@/lib/stores";
import type { WorkspaceVisibility } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineStyle: "none" } as const) : undefined;

/**
 * A deliberately heavy, type-to-confirm modal for the irreversible workspace
 * deletion. Lists exactly what is destroyed and requires the user to retype the
 * workspace name before the destructive button unlocks.
 */
function DeleteWorkspaceModal({
  visible,
  workspaceName,
  memberCount,
  loading,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  workspaceName: string;
  memberCount: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const matches = confirmText.trim() === workspaceName.trim();

  const consequences: { icon: keyof typeof MaterialIcons.glyphMap; label: string }[] = [
    { icon: "checklist", label: "Wszystkie zadania i tablica Kanban" },
    { icon: "event", label: "Wszystkie wydarzenia w kalendarzu" },
    { icon: "sticky-note-2", label: "Wszystkie notatki" },
    { icon: "tune", label: "Kategorie i statusy" },
    { icon: "group", label: `Dostęp ${memberCount} ${memberCount === 1 ? "członka" : "członków"}` },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center p-6">
        <View
          className="bg-surface-container-lowest rounded-2xl w-full max-w-md border border-outline-variant overflow-hidden"
          style={{
            shadowColor: "#101828",
            shadowOffset: { width: 0, height: 24 },
            shadowOpacity: 0.3,
            shadowRadius: 60,
            elevation: 12,
          }}
        >
          <View className="px-5 pt-5 pb-4 gap-3">
            <View className="flex-row items-center gap-3">
              <View className="w-11 h-11 rounded-xl items-center justify-center bg-error-container">
                <MaterialIcons name="warning-amber" size={22} color="#C0392B" />
              </View>
              <View className="flex-1 min-w-0">
                <Text className="text-on-surface font-display text-title-lg">
                  Usuń workspace
                </Text>
                <Text
                  className="text-on-surface-variant font-body text-xs"
                  numberOfLines={1}
                >
                  „{workspaceName}"
                </Text>
              </View>
            </View>

            <View className="rounded-xl border border-[rgba(192,57,43,0.35)] bg-error-container/60 px-3.5 py-3 gap-1">
              <Text className="text-[#C0392B] font-headline text-sm">
                Tej operacji nie można cofnąć.
              </Text>
              <Text className="text-on-surface-variant font-body text-xs leading-4">
                Workspace zostanie usunięty na stałe wraz ze wszystkimi danymi.
                Tego nie da się odzyskać.
              </Text>
            </View>

            <View className="gap-2 mt-1">
              <Text className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">
                Co zostanie trwale usunięte
              </Text>
              {consequences.map((c) => (
                <View key={c.label} className="flex-row items-center gap-2.5">
                  <MaterialIcons name={c.icon} size={16} color="#9b9791" />
                  <Text className="text-on-surface font-body text-sm flex-1">
                    {c.label}
                  </Text>
                </View>
              ))}
            </View>

            <View className="gap-1.5 mt-1">
              <Text className="text-on-surface-variant font-body text-xs">
                Aby potwierdzić, wpisz nazwę workspace:{" "}
                <Text className="text-on-surface font-headline">
                  {workspaceName}
                </Text>
              </Text>
              <TextInput
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder={workspaceName}
                placeholderTextColor="#9b9791"
                autoCapitalize="none"
                autoCorrect={false}
                className="rounded-md border border-outline-variant bg-surface px-3.5 py-3 text-on-surface font-body text-body-md"
                style={[NO_OUTLINE, { borderWidth: 1 }]}
              />
            </View>
          </View>

          <View className="flex-row gap-3 px-5 pb-5 pt-1">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 items-center justify-center py-3 rounded-md border border-outline-variant bg-surface"
            >
              <Text className="text-on-surface font-headline text-sm">
                Anuluj
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={!matches || loading}
              className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-md"
              style={{
                backgroundColor: "#C0392B",
                opacity: !matches || loading ? 0.4 : 1,
              }}
            >
              <MaterialIcons name="delete-outline" size={18} color="#ffffff" />
              <Text className="text-white font-headline text-sm">
                Usuń trwale
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function confirmAction(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void,
) {
  if (Platform.OS === "web") {
    if (
      typeof window !== "undefined" &&
      window.confirm(`${title}\n\n${message}`)
    ) {
      onConfirm();
    }
    return;
  }
  Alert.alert(title, message, [
    { text: "Anuluj", style: "cancel" },
    { text: confirmLabel, style: "destructive", onPress: onConfirm },
  ]);
}

export default function WorkspaceSettingsScreen() {
  const { workspaceId } = useLocalSearchParams<{ workspaceId: string }>();
  const router = useRouter();
  const { workspaces } = useWorkspaces();
  const currentUser = useAuthStore((s) => s.user);
  const deleteWorkspace = useDeleteWorkspace();
  const assignByEmail = useAssignWorkspaceUsersByEmail();
  const removeUsers = useRemoveWorkspaceUsers();
  const setVisibility = useSetWorkspaceVisibility();
  const defaultWorkspaceId = useWorkspaceStore((s) => s.defaultWorkspaceId);
  const setDefaultWorkspace = useWorkspaceStore((s) => s.setDefaultWorkspace);
  const workspace = workspaces.find((w) => w.workspaceId === workspaceId);

  const isPublic = workspace?.visibility === "Public";
  const isDefault = !!workspace && workspace.workspaceId === defaultWorkspaceId;

  const [pendingEmails, setPendingEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resultMsg, setResultMsg] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [visibilityError, setVisibilityError] = useState<string | null>(null);

  const isOwner = !!workspace && workspace.createdBy === currentUser?.userId;

  function addPendingEmail() {
    const value = emailInput.trim().toLowerCase();
    setResultMsg(null);
    if (!value) return;
    if (!EMAIL_RE.test(value)) {
      setEmailError("Niepoprawny adres email");
      return;
    }
    if (pendingEmails.includes(value)) {
      setEmailError("Ten adres jest już na liście");
      return;
    }
    setPendingEmails((prev) => [...prev, value]);
    setEmailInput("");
    setEmailError(null);
  }

  function removePendingEmail(email: string) {
    setPendingEmails((prev) => prev.filter((e) => e !== email));
  }

  async function handleInvite() {
    if (!workspaceId || pendingEmails.length === 0) return;
    setResultMsg(null);
    try {
      const res = await assignByEmail.mutateAsync({
        workspaceId,
        emails: pendingEmails,
      });
      const parts: string[] = [];
      if (res.addedEmails.length > 0)
        parts.push(`Dodano: ${res.addedEmails.join(", ")}`);
      if (res.alreadyAssignedEmails.length > 0)
        parts.push(`Już w workspace: ${res.alreadyAssignedEmails.join(", ")}`);
      if (res.notFoundEmails.length > 0)
        parts.push(`Nie znaleziono: ${res.notFoundEmails.join(", ")}`);
      setResultMsg(parts.join("\n"));
      setPendingEmails([]);
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { title?: string } };
        message?: string;
      };
      setResultMsg(
        err.response?.data?.title ??
          err.message ??
          "Nie udało się dodać użytkowników",
      );
    }
  }

  function handleRemoveMember(userId: string, label: string) {
    if (!workspaceId) return;
    confirmAction(
      "Usuń użytkownika",
      `Czy na pewno chcesz usunąć ${label} z tego workspace?`,
      "Usuń",
      () => removeUsers.mutate({ workspaceId, userIds: [userId] }),
    );
  }

  function handleDelete() {
    setDeleteModalOpen(true);
  }

  async function performDelete() {
    if (!workspaceId) return;
    await deleteWorkspace.mutateAsync(workspaceId);
    setDeleteModalOpen(false);
    const remaining = useWorkspaceStore.getState().workspaces;
    if (remaining.length === 0) {
      router.replace("/(app)/workspace-create" as never);
    } else {
      router.replace("/(app)/workspaces" as never);
    }
  }

  function changeVisibility(next: WorkspaceVisibility) {
    if (!workspace || next === workspace.visibility) return;
    setVisibilityError(null);
    setVisibility.mutate(
      { workspaceId: workspace.workspaceId, visibility: next },
      {
        onError: (e: unknown) => {
          const err = e as {
            response?: { data?: { title?: string } };
            message?: string;
          };
          setVisibilityError(
            err.response?.data?.title ??
              err.message ??
              "Nie udało się zmienić widoczności",
          );
        },
      },
    );
  }

  if (!workspace) {
    return (
      <PageLayout>
        <Text className="text-on-surface-variant p-4">
          Workspace nie znaleziony.
        </Text>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <View className="gap-4 p-4 max-w-2xl w-full self-center">
        <Card className="p-5 gap-4">
          <View className="flex-row items-center gap-3">
            <View className="w-12 h-12 rounded-2xl bg-primary-fixed items-center justify-center">
              <MaterialIcons name="workspaces" size={24} color="#5b4ee0" />
            </View>
            <View className="flex-1 min-w-0">
              <Text
                className="text-on-surface font-headline text-xl"
                numberOfLines={1}
              >
                {workspace.workspaceName}
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View
                  className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${
                    isPublic ? "bg-accent/10" : "bg-surface-container"
                  }`}
                >
                  <MaterialIcons
                    name={isPublic ? "group" : "lock"}
                    size={11}
                    color={isPublic ? "#5b4ee0" : "#9b9791"}
                  />
                  <Text
                    className={`font-label text-[10px] uppercase tracking-wider ${
                      isPublic ? "text-accent" : "text-text-tertiary"
                    }`}
                  >
                    {isPublic ? "Publiczny" : "Prywatny"}
                  </Text>
                </View>
                <Text className="text-on-surface-variant font-body text-xs">
                  {isOwner ? "Twój workspace" : "Należysz do tego workspace"}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 flex-row items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2.5">
              <MaterialIcons name="group" size={18} color="#6b6965" />
              <View>
                <Text className="text-on-surface font-headline text-sm">
                  {workspace.assignedUsers.length}
                </Text>
                <Text className="text-on-surface-variant font-body text-[11px]">
                  {workspace.assignedUsers.length === 1
                    ? "członek"
                    : "członków"}
                </Text>
              </View>
            </View>
            <View className="flex-1 flex-row items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2.5">
              <MaterialIcons name="event" size={18} color="#6b6965" />
              <View className="flex-1 min-w-0">
                <Text className="text-on-surface font-headline text-sm">
                  {new Date(workspace.createdAt).toLocaleDateString("pl-PL")}
                </Text>
                <Text className="text-on-surface-variant font-body text-[11px]">
                  utworzono
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card className="p-4 gap-3">
          <Text className="text-on-surface font-headline text-sm">
            Widoczność
          </Text>
          <Text className="text-on-surface-variant font-body text-xs -mt-1">
            Decyduje, czy do workspace można zapraszać inne osoby.
          </Text>

          {visibilityError ? (
            <View className="bg-error-container rounded-xl px-3.5 py-2.5">
              <Text className="text-on-error-container font-body text-xs">
                {visibilityError}
              </Text>
            </View>
          ) : null}

          {(
            [
              {
                key: "Private" as const,
                icon: "lock" as const,
                title: "Prywatny",
                desc: "Tylko Ty masz dostęp. Nie można dodawać członków.",
              },
              {
                key: "Public" as const,
                icon: "group" as const,
                title: "Publiczny",
                desc: "Możesz zapraszać i przypisywać członków.",
              },
            ]
          ).map((opt) => {
            const selected = workspace.visibility === opt.key;
            const disabled = !isOwner || setVisibility.isPending;
            return (
              <TouchableOpacity
                key={opt.key}
                disabled={disabled || selected}
                onPress={() => changeVisibility(opt.key)}
                className={`flex-row items-center gap-3 rounded-md border px-4 py-3 ${
                  selected
                    ? "border-accent bg-surface-container-low"
                    : "border-outline-variant"
                }`}
                style={{ opacity: disabled && !selected ? 0.5 : 1 }}
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
                    selected ? "radio-button-checked" : "radio-button-unchecked"
                  }
                  size={20}
                  color={selected ? "#5b4ee0" : "#9b9791"}
                />
              </TouchableOpacity>
            );
          })}

          <View className="flex-row items-start gap-2 bg-surface-container-low rounded-xl px-3.5 py-2.5">
            <MaterialIcons name="info-outline" size={15} color="#9b9791" />
            <Text className="text-on-surface-variant font-body text-xs leading-4 flex-1">
              {!isOwner
                ? "Tylko właściciel workspace może zmienić jego widoczność."
                : isPublic
                  ? "Zmiana na prywatny zachowa obecnych członków, ale nie dodasz już nowych osób."
                  : "Zmiana na publiczny pozwoli zapraszać i przypisywać członków po adresie email."}
            </Text>
          </View>

          <View className="h-px bg-border-subtle my-1" />

          <Text className="text-on-surface font-headline text-sm">
            Domyślny workspace
          </Text>

          <TouchableOpacity
            disabled={isDefault}
            onPress={() => setDefaultWorkspace(workspace.workspaceId)}
            className={`flex-row items-center gap-3 rounded-md border px-4 py-3 ${
              isDefault ? "border-primary bg-surface-container-low" : "border-outline-variant"
            }`}
          >
            <MaterialIcons
              name={isDefault ? "star" : "star-outline"}
              size={20}
              color={isDefault ? "#5b4ee0" : "#6b6965"}
            />
            <View className="flex-1">
              <Text className="text-on-surface font-body text-sm">
                {isDefault ? "Domyślny workspace" : "Ustaw jako domyślny"}
              </Text>
              <Text className="text-on-surface-variant font-body text-xs">
                Otwierany po starcie aplikacji.
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        <Card className="p-4 gap-3">
          <Text className="text-on-surface font-headline text-sm">
            Członkowie ({workspace.assignedUsers.length})
          </Text>

          <View className="gap-2">
            {workspace.assignedUsers.map((member) => {
              const name =
                member.fullName?.trim() || member.email || member.userId;
              const isCreator = member.userId === workspace.createdBy;
              const isSelf = member.userId === currentUser?.userId;
              return (
                <View
                  key={member.userId}
                  className="flex-row items-center gap-3 p-3 rounded-xl bg-surface-container-lowest border border-outline-variant"
                >
                  <Avatar fullName={name} size="sm" />
                  <View className="flex-1 min-w-0">
                    <Text
                      className="text-on-surface font-body text-sm"
                      numberOfLines={1}
                    >
                      {name}
                    </Text>
                    {member.email ? (
                      <Text
                        className="text-on-surface-variant font-body text-xs"
                        numberOfLines={1}
                      >
                        {member.email}
                      </Text>
                    ) : null}
                  </View>
                  {isCreator ? (
                    <View className="px-2 py-1 rounded-lg bg-surface-container-low">
                      <Text className="text-on-surface-variant font-label text-xs">
                        Właściciel
                      </Text>
                    </View>
                  ) : isOwner && !isSelf ? (
                    <TouchableOpacity
                      onPress={() => handleRemoveMember(member.userId, name)}
                      className="w-9 h-9 items-center justify-center rounded-lg bg-error-container"
                      disabled={removeUsers.isPending}
                    >
                      <MaterialIcons
                        name="person-remove"
                        size={18}
                        color="#C0392B"
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
          </View>
        </Card>

        {isOwner && isPublic ? (
          <Card className="p-4 gap-3">
            <Text className="text-on-surface font-headline text-sm">
              Dodaj użytkowników po adresie email
            </Text>

            <Input
              placeholder="np. jan.kowalski@example.com"
              value={emailInput}
              onChangeText={(t) => {
                setEmailInput(t);
                setEmailError(null);
              }}
              onSubmitEditing={addPendingEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              error={emailError ?? undefined}
              returnKeyType="done"
            />
            <Button
              label="Dodaj do listy"
              variant="secondary"
              icon="add"
              fullWidth
              onPress={addPendingEmail}
            />

            {pendingEmails.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {pendingEmails.map((email) => (
                  <View
                    key={email}
                    className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant"
                  >
                    <Text className="text-on-surface font-body text-xs">
                      {email}
                    </Text>
                    <TouchableOpacity onPress={() => removePendingEmail(email)}>
                      <MaterialIcons name="close" size={14} color="#9b9791" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : null}

            {resultMsg ? (
              <View className="bg-surface-container-low rounded-xl px-3 py-2.5">
                <Text className="text-on-surface-variant font-body text-xs leading-4">
                  {resultMsg}
                </Text>
              </View>
            ) : null}

            <Button
              label={`Zaproś (${pendingEmails.length})`}
              loading={assignByEmail.isPending}
              disabled={pendingEmails.length === 0}
              fullWidth
              onPress={handleInvite}
            />
          </Card>
        ) : null}

        {isOwner ? (
          <Card className="p-4 gap-3">
            <View className="flex-row items-center gap-2">
              <MaterialIcons name="warning-amber" size={18} color="#C0392B" />
              <Text className="text-on-surface font-headline text-sm">
                Strefa zagrożenia
              </Text>
            </View>
            <Text className="text-on-surface-variant font-body text-xs leading-4">
              Usunięcie workspace jest nieodwracalne. Wszystkie zadania,
              wydarzenia i ustawienia zostaną trwale usunięte.
            </Text>
            <TouchableOpacity
              onPress={handleDelete}
              disabled={deleteWorkspace.isPending}
              className="flex-row items-center justify-center gap-2 py-3 rounded-xl border border-error/40 bg-error-container"
              style={{ opacity: deleteWorkspace.isPending ? 0.6 : 1 }}
            >
              <MaterialIcons name="delete-outline" size={18} color="#C0392B" />
              <Text className="text-error font-headline text-sm">
                Usuń workspace
              </Text>
            </TouchableOpacity>
          </Card>
        ) : null}
      </View>

      <DeleteWorkspaceModal
        visible={deleteModalOpen}
        workspaceName={workspace.workspaceName}
        memberCount={workspace.assignedUsers.length}
        loading={deleteWorkspace.isPending}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={performDelete}
      />
    </PageLayout>
  );
}
