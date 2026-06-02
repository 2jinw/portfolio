/**
 * Decorative background blobs + italic glyph marks that drift slowly behind
 * the page content. Pure CSS animation (see `.float-shape` / `.float-mark`
 * keyframes in globals.css), so no runtime overhead. Position: fixed -z-10
 * so the shapes follow the viewport, not the document height.
 */
export function FloatingShapes() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <span className="float-shape float-1" />
      <span className="float-shape float-2" />
      <span className="float-shape float-3" />
      <span className="float-mark float-mark-1">¶</span>
      <span className="float-mark float-mark-2">§</span>
    </div>
  );
}
