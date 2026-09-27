import { useEffect, useRef, useState } from "react";
import { Animated, Text } from "react-native";

export type Point = { x: number; y: number };

export type Flight = {
  id: number;
  text: string;
  from: Point;
  /** Current target position; it moves while the surrounding sections fold. */
  measureTarget: (cb: (p: Point) => void) => void;
  fromClass: string;
  toClass: string;
};

const DURATION = 560;
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * The email address travelling between the input and the sentence that names it,
 * so the user sees where the message went. Drawn on top of the form, relative to
 * its root, and removed on arrival (the real text is revealed by the parent).
 */
export function EmailFlight({ flight, onDone }: { flight: Flight; onDone: () => void }) {
  const pos = useRef(new Animated.ValueXY(flight.from)).current;
  const [secondHalf, setSecondHalf] = useState(false);

  useEffect(() => {
    let frame = 0;
    let target = flight.from;
    let half = false;
    const start = Date.now();
    const tick = () => {
      flight.measureTarget((p) => {
        target = p;
      });
      const t = Math.min(1, (Date.now() - start) / DURATION);
      const e = ease(t);
      pos.setValue({
        x: flight.from.x + (target.x - flight.from.x) * e,
        y: flight.from.y + (target.y - flight.from.y) * e,
      });
      if (!half && t >= 0.5) {
        half = true;
        setSecondHalf(true);
      }
      if (t < 1) frame = requestAnimationFrame(tick);
      else onDone();
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flight.id]);

  return (
    <Animated.View
      pointerEvents="none"
      aria-hidden
      importantForAccessibility="no-hide-descendants"
      className="bg-brand-paper rounded"
      style={{
        position: "absolute",
        left: -4,
        top: 0,
        paddingHorizontal: 4,
        zIndex: 10,
        transform: pos.getTranslateTransform(),
      }}
    >
      <Text numberOfLines={1} className={`text-brand-ink text-base leading-6 ${secondHalf ? flight.toClass : flight.fromClass}`}>
        {flight.text}
      </Text>
    </Animated.View>
  );
}
