"use client";

import { startTransition, useEffect, useRef, useState, ViewTransition } from "react";

type Phase = "intro" | "out" | "done";

const NAME = "Lee Jinwon";
const COUNT_DURATION = 1800;
const OUT_DELAY = 1900;
// 콘텐츠 reveal 트랜지션(OUT_DELAY + 100ms delay + 1100ms)이 ~3100ms에 끝나므로
// 그 이후에 스플래시를 제거해야 마지막 구간이 끊기지 않고 매끄럽게 이어진다.
const DONE_DELAY = 3300;
const STORAGE_KEY = "splash-seen-v1";

export function Splash() {
  const [shouldRender, setShouldRender] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [count, setCount] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }

    if (seen) {
      document.documentElement.classList.remove("splash-pending");
      return;
    }

    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {}

    setShouldRender(true);
    document.documentElement.classList.remove("splash-pending");
    document.body.classList.add("splash-on");

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / COUNT_DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (elapsed < COUNT_DURATION) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    const outTimer = setTimeout(() => {
      setPhase("out");
      document.body.classList.add("splash-revealing");
    }, OUT_DELAY);

    const doneTimer = setTimeout(() => {
      startTransition(() => {
        setPhase("done");
      });
      document.body.classList.remove("splash-on", "splash-revealing");
    }, DONE_DELAY);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
      document.body.classList.remove("splash-on", "splash-revealing");
    };
  }, []);

  if (!shouldRender) return null;
  if (phase === "done") return null;

  const chars = NAME.split("");

  return (
    <div
      aria-hidden
      className={`splash-overlay fixed inset-0 z-[100] overflow-hidden ${
        phase === "out" ? "splash-overlay--out" : ""
      }`}
    >
      <div className="splash-grid" />

      <div
        className="splash-corner splash-corner--tl splash-fade"
        style={{ animationDelay: "150ms" }}
      >
        Portfolio &middot; 2026
      </div>
      <div
        className="splash-corner splash-corner--tr splash-fade"
        style={{ animationDelay: "250ms" }}
      >
        SSAFY 14 &middot; 광주
      </div>
      <div
        className="splash-corner splash-corner--bl splash-fade"
        style={{ animationDelay: "350ms" }}
      >
        Full-stack &middot; Mobile &middot; Embedded Sim
      </div>

      <div className="splash-counter">
        <span
          className="splash-counter-num splash-fade"
          style={{ animationDelay: "200ms" }}
        >
          {String(count).padStart(3, "0")}
        </span>
        <span
          className="splash-counter-pct splash-fade"
          style={{ animationDelay: "300ms" }}
        >
          %
        </span>
      </div>

      <div className="splash-center">
        <div
          className="splash-eyebrow splash-fade"
          style={{ animationDelay: "100ms" }}
        >
          <span className="splash-dot" /> Lee Jinwon &mdash; Portfolio
        </div>

        <div className="splash-name">
          {chars.map((c, i) => (
            <span
              key={i}
              className="splash-char"
              style={{ ["--i" as never]: i } as React.CSSProperties}
            >
              {c === " " ? " " : c}
            </span>
          ))}
        </div>

        <div
          className="splash-sub splash-fade"
          style={{ animationDelay: "1000ms" }}
        >
          Build end-to-end &middot; Bridge the gaps &middot; Ship as one
        </div>
      </div>

      <div className="splash-bar">
        <div className="splash-bar-fill" style={{ width: `${count}%` }} />
      </div>
    </div>
  );
}
