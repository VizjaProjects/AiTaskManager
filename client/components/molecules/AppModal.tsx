import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, Easing, Modal, Platform, StyleSheet } from "react-native";
import { MORPH_EASING } from "./Fold";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";

const NATIVE_DRIVER = Platform.OS !== "web";

/**
 * Dialog shell: the dim fades in, the panel fades and rises into place, and on
 * close both leave before the modal unmounts. Children lay out the panel
 * (centering, outside-press) without a dim of their own. While closing, the
 * last open children stay on screen so the panel doesn't empty mid-exit.
 */
export function AppModal({
  visible,
  onRequestClose,
  dim = 0.4,
  from = "rise",
  origin,
  children,
}: {
  visible: boolean;
  onRequestClose?: () => void;
  dim?: number;
  /** "right": a drawer sliding in from the right edge. */
  from?: "rise" | "right";
  /** Screen point the panel grows out of (the button that opened it). */
  origin?: { x: number; y: number } | null;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;
  const lastChildren = useRef(children);
  const lastOrigin = useRef(origin);
  if (visible) {
    lastChildren.current = children;
    lastOrigin.current = origin;
  }
  // Callers often clear their anchor on close; the exit shrinks back to where it grew from.
  const anchorAt = visible ? origin : lastOrigin.current;

  useEffect(() => {
    progress.stopAnimation();
    if (visible) {
      setMounted(true);
      Animated.timing(progress, {
        toValue: 1,
        duration: reduced ? 160 : 240,
        easing: MORPH_EASING,
        useNativeDriver: NATIVE_DRIVER,
      }).start();
    } else {
      Animated.timing(progress, {
        toValue: 0,
        duration: reduced ? 120 : 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: NATIVE_DRIVER,
      }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible && !mounted) return null;

  const along = (a: number, b: number) =>
    progress.interpolate({ inputRange: [0, 1], outputRange: [a, b] });
  const panel =
    from === "right"
      ? {
          // The drawer stays opaque while it travels; reduced motion only nudges it.
          opacity: progress.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 1] }),
          transform: [{ translateX: along(reduced ? 24 : 420, 0) }],
        }
      : anchorAt
        ? {
            opacity: progress,
            transform: [{ scale: along(reduced ? 0.98 : 0.9, 1) }],
            transformOrigin: `${Math.round(anchorAt.x)}px ${Math.round(anchorAt.y)}px`,
          }
        : {
            opacity: progress,
            transform: [{ translateY: along(reduced ? 0 : 12, 0) }],
          };

  return (
    <Modal visible transparent animationType="none" onRequestClose={onRequestClose}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${dim})`, opacity: progress }]}
      />
      <Animated.View
        pointerEvents={visible ? "box-none" : "none"}
        style={[{ flex: 1 }, panel as any]}
      >
        {visible ? children : lastChildren.current}
      </Animated.View>
    </Modal>
  );
}
