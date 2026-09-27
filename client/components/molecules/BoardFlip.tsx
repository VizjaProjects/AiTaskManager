import { Component, type ReactNode } from "react";
import { Platform, View } from "react-native";

type Rects = Map<string, DOMRect>;

const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";

let landing: { id: string; x: number; y: number; at: number } | null = null;

/** Where a dropped card was let go (its top-left corner), so it settles from there. */
export function markLanding(id: string, x: number, y: number) {
  landing = { id, x, y, at: Date.now() };
}

function measure(root: HTMLElement): Rects {
  const out: Rects = new Map();
  root.querySelectorAll<HTMLElement>("[data-flip-id]").forEach((el) => {
    out.set(el.dataset.flipId!, el.getBoundingClientRect());
  });
  return out;
}

type Props = {
  /** Changes whenever cards change place; a change triggers the animation. */
  flipKey: string;
  /** While true (a modal covers the board) moves are collected and played on release. */
  hold?: boolean;
  reduced?: boolean;
  /** Containers clip their items (kanban columns): long sideways moves arrive from the side instead of gliding. */
  clipped?: boolean;
  children: ReactNode;
};

/**
 * Web-only FLIP for the kanban: elements marked with `data-flip-id` glide from
 * where they were to where the new layout puts them. Rects are read right before
 * React commits, so scrolling between renders doesn't matter.
 */
export class BoardFlip extends Component<Props> {
  private root: View | null = null;
  private held: Rects | null = null;

  private el() {
    return Platform.OS === "web" ? (this.root as unknown as HTMLElement | null) : null;
  }

  getSnapshotBeforeUpdate(prev: Props): Rects | null {
    const root = this.el();
    if (!root) return null;
    if (this.props.hold) {
      if (!prev.hold) this.held = measure(root);
      return null;
    }
    if (prev.hold) return null;
    return prev.flipKey !== this.props.flipKey ? measure(root) : null;
  }

  componentDidUpdate(prev: Props, _state: unknown, snapshot: Rects | null) {
    let before = snapshot;
    if (prev.hold && !this.props.hold) {
      before = this.held;
      this.held = null;
    }
    if (before) this.play(before);
  }

  private play(before: Rects) {
    const root = this.el();
    if (!root) return;
    const { reduced } = this.props;
    const land = landing && Date.now() - landing.at < 2000 ? landing : null;

    root.querySelectorAll<HTMLElement>("[data-flip-id]").forEach((el) => {
      if (typeof el.animate !== "function") return;
      const id = el.dataset.flipId!;
      const now = el.getBoundingClientRect();

      if (land?.id === id) {
        landing = null;
        if (reduced) {
          el.animate([{ opacity: 0.4 }, { opacity: 1 }], { duration: 200, easing: EASE });
        } else {
          el.animate(
            [
              { transform: `translate(${land.x - now.left}px, ${land.y - now.top}px) scale(1.03)` },
              { transform: "none" },
            ],
            { duration: 320, easing: EASE },
          );
        }
        return;
      }

      const was = before.get(id);
      if (!was) {
        if (before.size) el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: EASE });
        return;
      }
      const dx = was.left - now.left;
      const dy = was.top - now.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

      // Columns clip their content, so a card changing columns can't visibly fly
      // across the board; it arrives from the side it came from instead.
      if (this.props.clipped !== false && Math.abs(dx) > 40) {
        el.animate(
          reduced
            ? [{ opacity: 0.3 }, { opacity: 1 }]
            : [
                { opacity: 0, transform: `translateX(${Math.sign(dx) * 28}px)` },
                { opacity: 1, transform: "none" },
              ],
          { duration: reduced ? 200 : 300, easing: EASE },
        );
        return;
      }
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
        duration: reduced ? 160 : 280,
        easing: EASE,
      });
    });
  }

  render() {
    return (
      <View ref={(r) => { this.root = r; }} style={{ flex: 1 }}>
        {this.props.children}
      </View>
    );
  }
}
