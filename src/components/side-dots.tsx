"use client";

import { useEffect, useState } from "react";

export type SideDotItem = { id: string; label: string };

/**
 * Fixed right-rail dot nav. Highlights whichever section is currently
 * intersecting the viewport. Clicking a dot smooth-scrolls to that section.
 * Hidden on small screens.
 */
export function SideDots({ items }: { items: SideDotItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const targets = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);
    if (targets.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the top of the viewport
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top) -
              Math.abs(b.boundingClientRect.top)
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: 0 }
    );

    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Section navigation"
      className="side-dots hidden lg:flex"
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          data-label={item.label}
          data-active={active === item.id}
          aria-label={`Jump to ${item.label}`}
        />
      ))}
    </nav>
  );
}
