import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Button, Input } from "@/components/atoms";
import { useCreateWorkspace } from "@/lib/hooks";
import type { WorkspaceVisibility } from "@/lib/types";

const schema = z.object({
  workspaceName: z.string().min(2, "Nazwa musi mieć co najmniej 2 znaki"),
});

type FormData = z.infer<typeof schema>;

export default function WorkspaceCreateScreen() {
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<WorkspaceVisibility>("Private");

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { workspaceName: "" },
  });

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      await createWorkspace.mutateAsync({
        name: data.workspaceName,
        visibility,
      });
      router.replace("/(app)/dashboard" as never);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { title?: string } }; message?: string };
      setError(err.response?.data?.title ?? err.message ?? "Nie udało się utworzyć workspace");
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background justify-center px-8">
      <View className="max-w-md w-full self-center gap-6">
        <View className="gap-2">
          <Text className="text-on-surface font-headline text-2xl">
            Utwórz workspace
          </Text>
          <Text className="text-on-surface-variant font-body text-sm">
            Workspace grupuje zadania, kalendarz i ustawienia Twojego zespołu.
          </Text>
        </View>

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
              label="Nazwa workspace"
              placeholder="np. Mój zespół"
              value={value}
              onChangeText={onChange}
              error={errors.workspaceName?.message}
            />
          )}
        />

        <View className="gap-2">
          <Text className="text-on-surface font-label text-body-md">
            Widoczność
          </Text>
          {(
            [
              {
                key: "Private" as const,
                icon: "lock" as const,
                title: "Prywatny",
                desc: "Tylko Ty. Nie można przypisać innych osób.",
              },
              {
                key: "Public" as const,
                icon: "group" as const,
                title: "Publiczny",
                desc: "Możesz zapraszać i przypisywać członków.",
              },
            ]
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
                <View className="flex-1">
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
        </View>

        <Button
          label="Utwórz workspace"
          fullWidth
          loading={createWorkspace.isPending}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </SafeAreaView>
  );
}
