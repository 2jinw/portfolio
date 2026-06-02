"use client";

import { useEffect, useRef } from "react";

/**
 * A thin gradient bar at the top of the viewport that reflects how far the
 * user has scrolled through the document. Runs entirely in the browser; safe
 * for static export.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const update = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      const pct = total > 0 ? Math.min(1, window.scrollY / total) : 0;
      el.style.width = `${pct * 100}%`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className="scroll-progress" style={{ width: 0 }} />;
}
