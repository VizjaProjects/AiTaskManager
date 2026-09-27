import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type Presence<T> = { key: string; item: T; entering: boolean; exiting: boolean };

/**
 * Keeps removed items rendered (at their old index) for `exitMs` so they can fold
 * away, and flags items that arrived after the first render so they can unfold.
 * Pair with `<Fold open={!exiting} appear={entering}>`.
 *
 * Removals are picked up during render, not in an effect: a commit without the
 * leaving item would already move its neighbours (and BoardFlip would animate that).
 */
export function usePresenceList<T>(
  items: T[],
  keyOf: (item: T) => string,
  exitMs = 420,
  /** A different value (e.g. another task opened) starts over: no enters, no exits. */
  resetKey?: string,
): Presence<T>[] {
  const known = useRef<Set<string> | null>(null);
  const prev = useRef<T[]>(items);
  const lastReset = useRef(resetKey);
  const leaving = useRef(new Map<string, { item: T; index: number; timed: boolean }>());
  const [, rerender] = useState(0);

  if (lastReset.current !== resetKey) {
    lastReset.current = resetKey;
    known.current = null;
    prev.current = items;
    leaving.current.clear();
  }

  const keys = new Set(items.map(keyOf));
  if (prev.current !== items) {
    prev.current.forEach((item, index) => {
      const k = keyOf(item);
      if (!keys.has(k) && !leaving.current.has(k)) {
        leaving.current.set(k, { item, index, timed: false });
      }
    });
    prev.current = items;
  }
  for (const k of keys) leaving.current.delete(k); // came back (e.g. rolled back)

  const firstRender = !known.current;
  const out: Presence<T>[] = items.map((item) => {
    const key = keyOf(item);
    return { key, item, entering: !firstRender && !known.current!.has(key), exiting: false };
  });
  for (const [key, { item, index }] of leaving.current) {
    out.splice(Math.min(index, out.length), 0, { key, item, entering: false, exiting: true });
  }

  useLayoutEffect(() => {
    if (known.current) for (const k of keys) known.current.add(k);
    else known.current = new Set(keys);
  });

  useEffect(() => {
    const pending = [...leaving.current].filter(([, v]) => !v.timed);
    if (!pending.length) return;
    for (const [, v] of pending) v.timed = true;
    const gone = pending.map(([k]) => k);
    setTimeout(() => {
      for (const k of gone) leaving.current.delete(k);
      rerender((n) => n + 1);
    }, exitMs);
  });

  return out;
}
