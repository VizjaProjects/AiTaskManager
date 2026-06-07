import { Platform } from "react-native";
import type { View } from "react-native";

export function viewToHTMLElement(node: View | null): HTMLElement | null {
  if (!node || Platform.OS !== "web") return null;
  const candidate = node as unknown as HTMLElement & {
    _nativeNode?: HTMLElement;
  };
  if (candidate instanceof HTMLElement) return candidate;
  if (candidate._nativeNode instanceof HTMLElement) return candidate._nativeNode;
  return candidate;
}

export function queryCalendarGridElement(): HTMLElement | null {
  if (Platform.OS === "web" && typeof document !== "undefined") {
    return document.querySelector('[data-calendar-grid="true"]');
  }
  return null;
}

export function readDataAttr(
  el: HTMLElement,
  name: string,
): string | null {
  return (
    el.getAttribute(`data-${name}`) ??
    el.getAttribute(`data-${name.replace(/-/g, "")}`) ??
    (el as HTMLElement & { dataset?: DOMStringMap }).dataset?.[
      name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    ] ??
    null
  );
}

export function findCalendarEventElement(
  target: HTMLElement,
  root?: HTMLElement | null,
): HTMLElement | null {
  let node: HTMLElement | null = target;
  while (node) {
    const eventId =
      readDataAttr(node, "event-id") ?? node.dataset?.eventId ?? null;
    if (eventId) return node;
    if (root && node === root) break;
    node = node.parentElement;
  }
  return null;
}

export function isCalendarResizeHandle(target: HTMLElement): boolean {
  return !!target.closest("[data-resize-handle]");
}
