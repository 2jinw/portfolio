"use client";

import { useRef, useEffect } from "react";

/**
 * Wraps a button-like element so it gently follows the cursor when nearby.
 * The element snaps back when the pointer leaves. Strength controls how far
 * it can drift (px).
 */
export function Magnetic({
  children,
  strength = 18,
  className = "",
}: {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const radius = Math.max(rect.width, rect.height);
      if (dist > radius * 1.8) {
        el.style.transform = "translate(0, 0)";
        return;
      }
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const factor = strength / radius;
        el.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = "translate(0, 0)";
    };

    window.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, [strength]);

  return (
    <span
      ref={ref}
      className={`inline-block transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </span>
  );
}
