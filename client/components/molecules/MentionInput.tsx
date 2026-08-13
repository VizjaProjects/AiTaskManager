import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Avatar } from "../atoms/Avatar";
import { useT } from "@/lib/i18n";
import { getUiTokens } from "@/lib/utils/uiTokens";
import {
  applyMention,
  findMentionQuery,
  matchMentionCandidates,
  MENTION_TRIGGER,
} from "@/lib/utils/mentions";
import type { WorkspaceMember } from "@/lib/types";

const NO_OUTLINE =
  Platform.OS === "web" ? ({ outlineWidth: 0 } as const) : undefined;

const MAX_SUGGESTIONS = 6;

export interface MentionInputHandle {
  insertTrigger: () => void;
}

interface MentionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  members: WorkspaceMember[];
  isDark: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  minHeight?: number;
}

export const MentionInput = forwardRef<MentionInputHandle, MentionInputProps>(
  function MentionInput(
    { value, onChangeText, members, isDark, placeholder, autoFocus, minHeight = 44 },
    ref,
  ) {
    const t = useT();
    const tokens = getUiTokens(isDark);
    const accent = isDark ? "#9b8cff" : "#5b4ee0";
    const inputRef = useRef<TextInput>(null);

    const [caret, setCaret] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [dismissedStart, setDismissedStart] = useState<number | null>(null);
    const [forcedSelection, setForcedSelection] = useState<{
      start: number;
      end: number;
    } | null>(null);

    const mention = useMemo(
      () => findMentionQuery(value, caret),
      [value, caret],
    );

    const candidates = useMemo(() => {
      if (!mention || !members.length) return [];
      if (dismissedStart === mention.start) return [];
      return matchMentionCandidates(members, mention.query).slice(
        0,
        MAX_SUGGESTIONS,
      );
    }, [mention, members, dismissedStart]);

    const open = candidates.length > 0;

    useEffect(() => {
      setActiveIndex(0);
    }, [mention?.start, mention?.query]);

    // Prop `selection` przejmuje kursor na stale, wiec puszczamy go zaraz po skoku.
    useEffect(() => {
      if (!forcedSelection) return;
      const id = setTimeout(() => setForcedSelection(null), 0);
      return () => clearTimeout(id);
    }, [forcedSelection]);

    function select(member: WorkspaceMember | undefined) {
      if (!member || !mention) return;
      const next = applyMention(value, mention, member.fullName);
      onChangeText(next.text);
      setCaret(next.caret);
      setForcedSelection({ start: next.caret, end: next.caret });
      setDismissedStart(null);
      inputRef.current?.focus();
    }

    function insertTrigger() {
      const at = Math.max(0, Math.min(caret, value.length));
      const before = value.slice(0, at);
      const after = value.slice(at);
      const leading = before.length > 0 && !/\s$/.test(before) ? " " : "";
      // Bez odstepu po prawej "@" wypadloby w srodku slowa i panel by nie wstal.
      const trailing = after && !/^\s/.test(after) ? " " : "";
      const nextCaret = before.length + leading.length + 1;
      onChangeText(`${before}${leading}${MENTION_TRIGGER}${trailing}${after}`);
      setCaret(nextCaret);
      setForcedSelection({ start: nextCaret, end: nextCaret });
      setDismissedStart(null);
      inputRef.current?.focus();
    }

    const keyStateRef = useRef({ open, candidates, activeIndex, select, mention });
    useEffect(() => {
      keyStateRef.current = { open, candidates, activeIndex, select, mention };
    });

    useImperativeHandle(ref, () => ({ insertTrigger }));

    // RN-Web nie gwarantuje strzalek w onKeyPress — sluchamy keydown na hoscie.
    useEffect(() => {
      if (Platform.OS !== "web") return;
      const node = inputRef.current as unknown as HTMLElement | null;
      if (!node?.addEventListener) return;

      function handleKeyDown(event: KeyboardEvent) {
        const state = keyStateRef.current;
        if (!state.open) return;
        const count = state.candidates.length;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setActiveIndex((index) => (index + 1) % count);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setActiveIndex((index) => (index - 1 + count) % count);
        } else if (event.key === "Enter" || event.key === "Tab") {
          event.preventDefault();
          state.select(state.candidates[state.activeIndex] ?? state.candidates[0]);
        } else if (event.key === "Escape") {
          event.preventDefault();
          setDismissedStart(state.mention?.start ?? null);
        }
      }

      node.addEventListener("keydown", handleKeyDown);
      return () => node.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
      <View>
        <View className="relative">
          <TextInput
            ref={inputRef}
            className="bg-surface-container-lowest rounded-xl pl-4 pr-11 py-3 text-on-surface font-body text-sm border border-outline-variant"
            style={[{ minHeight }, NO_OUTLINE]}
            multiline
            autoFocus={autoFocus}
            value={value}
            onChangeText={onChangeText}
            selection={forcedSelection ?? undefined}
            onSelectionChange={(event) =>
              setCaret(event.nativeEvent.selection.end)
            }
            placeholder={placeholder}
            placeholderTextColor="#6b6965"
          />
          <TouchableOpacity
            onPress={insertTrigger}
            hitSlop={6}
            accessibilityLabel={t("comments.mentionInsert")}
            className="absolute right-2 top-2 w-7 h-7 rounded-full items-center justify-center"
            style={{ backgroundColor: open ? accent : "transparent" }}
          >
            <MaterialIcons
              name="alternate-email"
              size={16}
              color={open ? "#ffffff" : tokens.textMuted}
            />
          </TouchableOpacity>
        </View>

        {open && (
          <View
            className="mt-2 rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden"
            style={tokens.shadow}
          >
            <View className="flex-row items-center gap-1.5 px-3 py-2 border-b border-outline-variant">
              <MaterialIcons
                name="alternate-email"
                size={13}
                color={accent}
              />
              <Text className="text-on-surface-variant font-label text-[11px] uppercase tracking-widest">
                {t("comments.mentionHint")}
              </Text>
            </View>
            <ScrollView
              style={{ maxHeight: 208 }}
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
            >
              {candidates.map((member, index) => {
                const isActive = index === activeIndex;
                return (
                  <TouchableOpacity
                    key={member.userId}
                    onPress={() => select(member)}
                    className="flex-row items-center gap-3 px-3 py-2.5"
                    style={{
                      backgroundColor: isActive
                        ? tokens.selectedBg
                        : "transparent",
                    }}
                  >
                    <Avatar fullName={member.fullName} size="sm" />
                    <View className="flex-1">
                      <Text
                        className="text-on-surface font-body text-sm"
                        numberOfLines={1}
                      >
                        {member.fullName}
                      </Text>
                      {!!member.email && (
                        <Text
                          className="text-on-surface-variant font-body text-xs"
                          numberOfLines={1}
                        >
                          {member.email}
                        </Text>
                      )}
                    </View>
                    {isActive && (
                      <MaterialIcons
                        name="keyboard-return"
                        size={14}
                        color={accent}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    );
  },
);
