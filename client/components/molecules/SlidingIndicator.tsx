import { useEffect, useRef, useState, type ReactNode } from "react";
import { Animated, type LayoutChangeEvent, type ViewStyle } from "react-native";
import { MORPH_EASING } from "./Fold";
import { useReducedMotion } from "@/lib/utils/useReducedMotion";

type Box = { x: number; y: number; w: number; h: number };

/**
 * Tracks the layout of a row/column of items and moves one indicator (underline,
 * pill, bar) to the selected one. Items report their box via `itemLayout(key)`;
 * the first placement and resizes snap, a change of selection slides.
 */
export function useSlidingIndicator(selected: string | null | undefined) {
  const reduced = useReducedMotion();
  const boxes = useRef<Record<string, Box>>({});
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  const w = useRef(new Animated.Value(0)).current;
  const h = useRef(new Animated.Value(0)).current;
  const [placed, setPlaced] = useState(false);
  const placedRef = useRef(false);
  const lastSelected = useRef(selected);

  function go(animate: boolean) {
    const b = selected ? boxes.current[selected] : undefined;
    if (!b) return;
    if (!animate || !placedRef.current) {
      x.setValue(b.x);
      y.setValue(b.y);
      w.setValue(b.w);
      h.setValue(b.h);
      if (!placedRef.current) {
        placedRef.current = true;
        setPlaced(true);
      }
      return;
    }
    const cfg = { duration: reduced ? 160 : 300, easing: MORPH_EASING, useNativeDriver: false };
    Animated.parallel([
      Animated.timing(x, { toValue: b.x, ...cfg }),
      Animated.timing(y, { toValue: b.y, ...cfg }),
      Animated.timing(w, { toValue: b.w, ...cfg }),
      Animated.timing(h, { toValue: b.h, ...cfg }),
    ]).start();
  }

  useEffect(() => {
    if (lastSelected.current === selected) return;
    lastSelected.current = selected;
    go(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const itemLayout = (key: string) => (e: LayoutChangeEvent) => {
    const { x: bx, y: by, width, height } = e.nativeEvent.layout;
    // A hidden screen (inactive tab) reports zero size; keep the last real box.
    if (!width || !height) return;
    boxes.current[key] = { x: bx, y: by, w: width, h: height };
    if (key === selected) go(false);
  };

  return { itemLayout, x, y, w, h, visible: placed && !!selected };
}

/**
 * The moving shape itself; render it as the first child of the items' parent so it
 * sits behind them. `edge="bottom"` draws an underline of `thickness`, otherwise
 * it fills the item's box (a pill). Colour goes on `children` / `fill`, because
 * className isn't applied to Animated views here.
 */
export function IndicatorShape({
  indicator,
  edge,
  thickness = 2,
  inset = 0,
  children,
  style,
}: {
  indicator: ReturnType<typeof useSlidingIndicator>;
  edge?: "bottom" | "left";
  thickness?: number;
  /** Shrinks the shape along its length (underline) — e.g. to skip item padding. */
  inset?: number;
  children: ReactNode;
  style?: ViewStyle;
}) {
  const { x, y, w, h, visible } = indicator;
  const pos =
    edge === "bottom"
      ? { left: Animated.add(x, inset), bottom: 0, height: thickness, width: Animated.add(w, -2 * inset) }
      : edge === "left"
        ? { left: 0, top: Animated.add(y, inset), width: thickness, height: Animated.add(h, -2 * inset) }
        : { left: x, top: y, width: w, height: h };
  return (
    <Animated.View
      pointerEvents="none"
      style={[{ position: "absolute", opacity: visible ? 1 : 0 }, pos as any, style]}
    >
      {children}
    </Animated.View>
  );
}
