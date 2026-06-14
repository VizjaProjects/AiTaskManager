import { useRef, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Avatar } from "../atoms/Avatar";
import { useAuthStore, useThemeStore } from "@/lib/stores";

type AnchorRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

interface MenuActionProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  description: string;
  iconColor: string;
  trailing?: React.ReactNode;
  onPress: () => void;
}

function MenuAction({
  icon,
  label,
  description,
  iconColor,
  trailing,
  onPress,
}: MenuActionProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.72}
      onPress={onPress}
      className="flex-row items-center gap-3 px-3 py-3 rounded-lg"
      style={{ minHeight: 56 }}
    >
      <View className="w-9 h-9 rounded-md items-center justify-center bg-surface-container-low">
        <MaterialIcons name={icon} size={19} color={iconColor} />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="font-headline text-body-md text-on-surface">
          {label}
        </Text>
        <Text
          className="font-body text-xs text-on-surface-variant mt-0.5"
          numberOfLines={1}
        >
          {description}
        </Text>
      </View>
      {trailing}
    </TouchableOpacity>
  );
}

export function UserMenu() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { mode, toggle } = useThemeStore();
  const { width } = useWindowDimensions();
  const triggerRef = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<AnchorRect | null>(null);

  if (!user) return null;

  const isDesktop = Platform.OS === "web" && width >= 1024;
  const panelWidth = Math.min(isDesktop ? 304 : 336, width - 24);
  const panelLeft = anchor
    ? Math.min(
        Math.max(12, anchor.x + anchor.width - panelWidth),
        width - panelWidth - 12,
      )
    : width - panelWidth - 12;
  const panelTop = anchor ? anchor.y + anchor.height + 8 : 60;
  const iconColor =
    mode === "dark" ? "rgba(255,255,255,0.62)" : "#6b6965";

  function openMenu() {
    triggerRef.current?.measureInWindow((x, y, triggerWidth, triggerHeight) => {
      setAnchor({ x, y, width: triggerWidth, height: triggerHeight });
      setOpen(true);
    });
  }

  function openSettings() {
    setOpen(false);
    router.push("/(app)/profile" as never);
  }

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open user menu"
          accessibilityState={{ expanded: open }}
          activeOpacity={0.78}
          onPress={openMenu}
          className={`p-1 -m-1 rounded-full ${
            open ? "bg-surface-container" : ""
          }`}
        >
          <Avatar fullName={user.fullName} size="sm" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close user menu"
          className="flex-1"
          style={{
            backgroundColor: isDesktop
              ? "rgba(0,0,0,0.04)"
              : "rgba(0,0,0,0.16)",
          }}
          onPress={() => setOpen(false)}
        >
          <View
            pointerEvents="box-none"
            style={{
              position: "absolute",
              top: panelTop,
              left: panelLeft,
              width: panelWidth,
            }}
          >
            <Pressable
              accessibilityRole="menu"
              onPress={(event) => event.stopPropagation()}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-2"
              style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: mode === "dark" ? 0.28 : 0.1,
                shadowRadius: 24,
                elevation: 10,
              }}
            >
              <View className="flex-row items-center gap-3 px-3 pt-2 pb-3">
                <Avatar fullName={user.fullName} size="md" />
                <View className="flex-1 min-w-0">
                  <Text
                    className="font-headline text-body-md text-on-surface"
                    numberOfLines={1}
                  >
                    {user.fullName}
                  </Text>
                  <Text
                    className="font-body text-xs text-on-surface-variant mt-0.5"
                    numberOfLines={1}
                  >
                    {user.email}
                  </Text>
                </View>
              </View>

              <View className="h-px bg-border-subtle mx-2 mb-1" />

              <MenuAction
                icon="settings"
                label="Settings"
                description="Account and AI preferences"
                iconColor={iconColor}
                trailing={
                  <MaterialIcons
                    name="chevron-right"
                    size={20}
                    color={iconColor}
                  />
                }
                onPress={openSettings}
              />

              <MenuAction
                icon={mode === "dark" ? "dark-mode" : "light-mode"}
                label="Theme"
                description={`${mode === "dark" ? "Dark" : "Light"} appearance`}
                iconColor={iconColor}
                trailing={
                  <View className="px-2 py-1 rounded-md bg-surface-container-low">
                    <Text className="font-label text-[11px] text-on-surface-variant">
                      {mode === "dark" ? "Dark" : "Light"}
                    </Text>
                  </View>
                }
                onPress={toggle}
              />
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
