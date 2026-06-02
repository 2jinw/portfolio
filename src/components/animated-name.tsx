/**
 * Splits a string into per-character spans so each glyph can be animated via
 * the `.char-stagger > span` rules in globals.css. Spaces are preserved with
 * non-breaking spaces so they participate in layout.
 */
export function AnimatedName({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`char-stagger ${className}`} aria-label={text}>
      {Array.from(text).map((ch, i) => (
        <span key={i} aria-hidden>
          {ch === " " ? " " : ch}
        </span>
      ))}
    </span>
  );
}
