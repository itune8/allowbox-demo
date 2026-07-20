'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Animates its own height whenever the content inside it changes size.
 *
 * The demo form swaps field sets when the role changes (School Admin has 4
 * fields, Teacher 3), which used to snap the card to its new height in a
 * single frame. Wrapping the role-dependent fields in this makes the card
 * grow/shrink smoothly instead.
 */
export function AutoHeight({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  // useEffect, not useLayoutEffect: this component is server-prerendered, and
  // the pre-measurement state is already the natural height, so there is no
  // flash to avoid — only React's SSR warning to.
  useEffect(() => {
    const el = inner.current;
    if (!el || typeof ResizeObserver === 'undefined') return;

    const measure = () => setHeight(el.getBoundingClientRect().height);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      // Height is set after the first layout pass, so the initial paint is
      // already at natural height — nothing animates on mount.
      className="overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
      style={height === null ? undefined : { height }}
    >
      {/* The negative margin + padding gives focus rings room so overflow-hidden
          doesn't clip them on the first and last field. */}
      <div ref={inner} className="-mx-1 px-1 pb-1">
        {children}
      </div>
    </div>
  );
}
