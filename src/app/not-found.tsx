import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[80vh] flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-pink">
        Error · 404
      </p>
      <h1
        className="mt-6 font-display font-bold leading-none tracking-tight text-ink"
        style={{ fontSize: "clamp(5rem, 18vw, 12rem)" }}
      >
        404
      </h1>
      <p className="mt-6 font-display text-xl italic text-muted sm:text-2xl">
        이 페이지는 발행되지 않았어요.
      </p>
      <p className="mt-2 text-sm text-subtle">
        요청하신 주소를 찾을 수 없습니다.
      </p>
      <Link
        href="/"
        className="mt-10 rounded-full border border-ink bg-ink px-6 py-2.5 text-sm text-page transition-colors hover:border-accent-blue hover:bg-accent-blue"
      >
        ← 표지로 돌아가기
      </Link>
    </main>
  );
}
