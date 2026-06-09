"use client";

import Image from "next/image";
import { useState } from "react";
import { asset } from "@/lib/asset";

type Slide = {
  title: string;
  src: string;
  alt: string;
  caption?: string;
};

/**
 * 스크린샷을 한 장씩 크게 보여주고 좌우로 넘기는 캐러셀.
 * 모바일 세로 캡처가 작은 격자에서 잘 안 보이는 문제를 해결하기 위해
 * 하나의 큰 뷰어로 묶고, 화살표·점·키보드(←/→)로 이동할 수 있게 한다.
 */
export function ScreenshotCarousel({
  slides,
  accent,
}: {
  slides: Slide[];
  accent: string;
}) {
  const [index, setIndex] = useState(0);
  const count = slides.length;
  const cur = slides[index];
  const go = (delta: number) => setIndex((p) => (p + delta + count) % count);

  return (
    <figure className="flex flex-col overflow-hidden rounded-2xl border border-line bg-panel lg:col-span-2">
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-h-[5.25rem]">
          <p className="font-display text-lg font-semibold">{cur.title}</p>
          {cur.caption ? (
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{cur.caption}</p>
          ) : null}
        </div>
        <span
          className="mt-0.5 shrink-0 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider tabular-nums"
          style={{
            color: accent,
            background: `color-mix(in srgb, ${accent} 14%, transparent)`,
          }}
        >
          {index + 1} / {count}
        </span>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center bg-page p-4 sm:p-6"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="앱 스크린샷"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
      >
        <Image
          key={cur.src}
          src={asset(cur.src)}
          alt={cur.alt}
          width={900}
          height={1600}
          unoptimized
          className="mx-auto max-h-[640px] w-auto rounded-xl border border-line bg-page object-contain"
        />

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="이전 스크린샷"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-panel/80 text-xl text-ink shadow-sm backdrop-blur transition-colors hover:bg-panel"
            >
              <span aria-hidden>‹</span>
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="다음 스크린샷"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-panel/80 text-xl text-ink shadow-sm backdrop-blur transition-colors hover:bg-panel"
            >
              <span aria-hidden>›</span>
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-line py-3">
          {slides.map((s, idx) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setIndex(idx)}
              aria-label={`${idx + 1}번째 스크린샷`}
              aria-current={idx === index}
              className="h-2 rounded-full transition-all"
              style={{
                width: idx === index ? 22 : 8,
                background:
                  idx === index
                    ? accent
                    : `color-mix(in srgb, ${accent} 28%, transparent)`,
              }}
            />
          ))}
        </div>
      )}
    </figure>
  );
}
