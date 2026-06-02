"use client";

import { useRef, type CSSProperties } from "react";

/**
 * Adds a subtle 3D tilt to its child as the pointer moves across it. The
 * effect is intentionally restrained (max ~6°) so it reads as a polished
 * surface rather than a gimmick.
 */
export function Tilt({
  children,
  className = "",
  style,
  max = 6,
}: {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - py) * max * 2;
    const ry = (px - 0.5) * max * 2;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
  };

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      style={style}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </div>
  );
}
