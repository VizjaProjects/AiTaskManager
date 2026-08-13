import { Text } from "react-native";
import { useMemo } from "react";
import { splitMentionText } from "@/lib/utils/mentions";
import type { WorkspaceMember } from "@/lib/types";

interface MentionTextProps {
  content: string;
  members: WorkspaceMember[];
  currentUserId?: string | null;
  isDark: boolean;
  className?: string;
}

export function MentionText({
  content,
  members,
  currentUserId,
  isDark,
  className,
}: MentionTextProps) {
  const accent = isDark ? "#9b8cff" : "#5b4ee0";
  const selfTint = isDark ? "rgba(155,140,255,0.18)" : "rgba(91,78,224,0.12)";
  const segments = useMemo(
    () => splitMentionText(content, members),
    [content, members],
  );

  return (
    <Text className={className}>
      {segments.map((segment, index) =>
        segment.member ? (
          <Text
            key={index}
            style={{
              color: accent,
              fontWeight: "500",
              backgroundColor:
                segment.member.userId === currentUserId
                  ? selfTint
                  : "transparent",
            }}
          >
            {segment.text}
          </Text>
        ) : (
          <Text key={index}>{segment.text}</Text>
        ),
      )}
    </Text>
  );
}
