import { createElement } from "react";
import { getTechIcon, techBrandColors } from "@/data/tech-icons";

type Variant = "default" | "compact";

/**
 * Pill-style tech name with a brand icon. The icon shows in brand color by
 * default; on hover the whole badge shifts toward the page accent. Variants:
 *   - default: full sized, used in the main Tech Stack section.
 *   - compact: smaller, used on project cards and detail pages.
 */
export function TechBadge({
  name,
  variant = "default",
}: {
  name: string;
  variant?: Variant;
}) {
  const icon = createElement(getTechIcon(name), {
    "aria-hidden": true,
    style: techBrandColors[name] ? { color: techBrandColors[name] } : undefined,
    className:
      variant === "compact"
        ? "h-3 w-3 shrink-0"
        : "transition-transform group-hover:scale-110",
  });

  if (variant === "compact") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-panel-2 px-2 py-0.5 font-mono text-[11px] text-muted transition-colors hover:text-ink">
        {icon}
        {name}
      </span>
    );
  }

  return (
    <span className="tech-badge group">
      {icon}
      {name}
    </span>
  );
}
