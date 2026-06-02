"use client";

import { useEffect, useRef } from "react";

type Direction = "up" | "down" | "left" | "right";

/**
 * Toggles `data-visible="true"` on the element when it scrolls into view.
 * Pair with the CSS rule `[data-reveal]` in globals.css for the actual
 * transition. `direction` controls which axis the element slides in on.
 */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  as: As = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-visible", "true");
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -80px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sharedProps = {
    "data-reveal": "",
    "data-direction": direction,
    style: { transitionDelay: `${delay}ms` },
    className,
  } as const;

  if (As === "section") {
    return (
      <section ref={ref as React.RefObject<HTMLElement>} {...sharedProps}>
        {children}
      </section>
    );
  }
  if (As === "article") {
    return (
      <article ref={ref as React.RefObject<HTMLElement>} {...sharedProps}>
        {children}
      </article>
    );
  }
  if (As === "li") {
    return (
      <li ref={ref as React.RefObject<HTMLLIElement>} {...sharedProps}>
        {children}
      </li>
    );
  }
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} {...sharedProps}>
      {children}
    </div>
  );
}
