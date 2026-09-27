import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/** System "reduce motion" setting (iOS/Android settings, prefers-reduced-motion on web). */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => active && setReduced(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    return () => {
      active = false;
      sub?.remove();
    };
  }, []);
  return reduced;
}
