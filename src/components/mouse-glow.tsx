"use client";

import { useEffect, useRef } from "react";

/**
 * Adds a soft radial-gradient glow that follows the cursor across the wrapped area.
 * Pointer position is exposed as `--mx` / `--my` CSS variables. The actual
 * gradient is painted by the `.mouse-glow` class on the inner layer.
 */
export function MouseGlow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let pendingX = 0;
    let pendingY = 0;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pendingX = ((e.clientX - rect.left) / rect.width) * 100;
      pendingY = ((e.clientY - rect.top) / rect.height) * 100;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.setProperty("--mx", pendingX + "%");
          el.style.setProperty("--my", pendingY + "%");
          raf = 0;
        });
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <div
        aria-hidden
        className="mouse-glow pointer-events-none absolute inset-0 -z-10"
      />
      {children}
    </div>
  );
}
