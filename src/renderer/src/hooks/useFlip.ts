import { useLayoutEffect, useRef } from "react";

/**
 * Animate children of `containerRef` from their previous position to their new one after a render.
 * Children are matched by their `data-flip-key` attribute. Nothing is measured until a change lands,
 * and the transform is cleared once the transition ends, so layout stays owned by the browser.
 */
export function useFlip(containerRef: React.RefObject<HTMLElement | null>, deps: unknown[]): void {
  const previous = useRef(new Map<string, DOMRect>());
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const children = [...container.querySelectorAll<HTMLElement>("[data-flip-key]")];
    const next = new Map<string, DOMRect>();
    for (const el of children) {
      const key = el.dataset.flipKey!;
      const rect = el.getBoundingClientRect();
      next.set(key, rect);
      const before = previous.current.get(key);
      if (!before) continue;
      const dy = before.top - rect.top;
      const dx = before.left - rect.left;
      if (Math.abs(dy) < 1 && Math.abs(dx) < 1) continue;
      el.style.transition = "none";
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      // Force the starting frame, then let the transition carry it home.
      void el.offsetHeight;
      el.style.transition = "transform 180ms cubic-bezier(0.16, 1, 0.3, 1)";
      el.style.transform = "";
      const clear = () => {
        el.style.transition = "";
        el.removeEventListener("transitionend", clear);
      };
      el.addEventListener("transitionend", clear);
    }
    previous.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
