import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { projects } from "@/data/projects";
import { profile } from "@/data/profile";
import { loadProject } from "@/lib/load-project";
import { asset } from "@/lib/asset";
import { TechBadge } from "@/components/tech-badge";

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

function SectionLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xs text-subtle">{n}</span>
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
        {title}
      </h2>
      <span className="flex-1 border-t border-dashed border-line" />
    </div>
  );
}

const mediaKindLabel = {
  gif: "GIF",
  screenshot: "SCREEN",
  preview: "PREVIEW",
  architecture: "ARCH",
} as const;

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = await loadProject(slug);
  if (!meta) notFound();
  const sectionNum = (base: number) => {
    const n = meta.background ? base + 1 : base;
    return String(n).padStart(2, "0");
  };

  return (
    <div
      className="bg-page"
      style={{ ["--accent" as string]: meta.accentColor }}
    >
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${meta.accentColor} 0%, color-mix(in srgb, ${meta.accentColor} 45%, transparent) 68%, transparent 100%)`,
        }}
      />

      <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink animate-fade-in"
        >
          <span aria-hidden>←</span> Home
        </Link>

        <header className="mt-10 animate-fade-up">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-subtle">
            {meta.period}
          </p>
          <ViewTransition name={`project-title-${meta.slug}`} share="morph">
            <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">
              {meta.displayName}
            </h1>
          </ViewTransition>
          <div className="mt-6 border-l-2 pl-5" style={{ borderColor: meta.accentColor }}>
            <p className="text-xl leading-relaxed sm:text-2xl">{meta.impact}</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-1.5">
            {meta.techStack.map((tech) => (
              <TechBadge key={tech} name={tech} variant="compact" />
            ))}
          </div>
        </header>

        {meta.background && (
          <section className="mt-20">
            <SectionLabel n="01" title="Background" />
            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-pink">
                  Problem
                </p>
                <p className="mt-3 max-w-prose leading-relaxed text-ink/90">
                  {meta.background.problem}
                </p>
                {meta.background.approach && (
                  <>
                    <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-accent-blue">
                      Our Approach
                    </p>
                    <p className="mt-3 max-w-prose leading-relaxed">
                      {meta.background.approach}
                    </p>
                  </>
                )}
              </div>
              {meta.background.evidence && meta.background.evidence.length > 0 && (
                <aside className="lg:col-span-5">
                  <div className="rounded-2xl border border-line bg-panel-2/40 p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-subtle">
                      Evidence · Notes
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-muted">
                      {meta.background.evidence.map((e, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed">
                          <span
                            className="mt-2 h-1 w-3 shrink-0"
                            style={{ background: meta.accentColor }}
                            aria-hidden
                          />
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              )}
            </div>
          </section>
        )}

        <section className="mt-20">
          <SectionLabel n={sectionNum(1)} title="Snapshot" />
          <div
            className={`mt-6 grid grid-cols-1 gap-4 ${
              meta.stats.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"
            }`}
            data-stagger
          >
            {meta.stats.map((stat, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-2xl border border-line bg-panel p-6"
              >
                <div
                  className="absolute right-0 top-0 h-28 w-28 -translate-y-1/2 translate-x-1/2 rounded-full opacity-15"
                  style={{ background: meta.accentColor }}
                />
                <p className="font-mono text-xs uppercase tracking-wider text-subtle">
                  {stat.label}
                </p>
                <p
                  className="mt-3 font-display text-4xl font-bold tracking-tight"
                  style={{ color: meta.accentColor }}
                >
                  {stat.value}
                </p>
                {stat.detail && (
                  <p className="mt-2 text-sm text-muted">{stat.detail}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionLabel n={sectionNum(2)} title="Role" />
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3" data-stagger>
            <div className="rounded-xl border border-line bg-panel p-5">
              <dt className="font-mono text-xs uppercase tracking-wider text-subtle">
                Team
              </dt>
              <dd className="mt-2 text-base">{meta.role.team}</dd>
            </div>
            <div className="rounded-xl border border-line bg-panel p-5 sm:col-span-2">
              <dt className="font-mono text-xs uppercase tracking-wider text-subtle">
                My Scope
              </dt>
              <dd className="mt-2 text-base leading-relaxed">{meta.role.myPart}</dd>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <SectionLabel n={sectionNum(3)} title="Visuals" />
          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2" data-stagger>
            {meta.media.map((item, i) => (
              <figure
                key={i}
                className={`overflow-hidden rounded-2xl border border-line bg-panel ${
                  item.kind === "architecture" ? "lg:col-span-2" : ""
                }`}
              >
                <div className="flex items-center justify-between border-b border-line px-5 py-3">
                  <div>
                    <p className="font-display text-lg font-semibold">{item.title}</p>
                    <p className="text-sm text-muted">{item.caption}</p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider"
                    style={{
                      color: meta.accentColor,
                      background: `color-mix(in srgb, ${meta.accentColor} 14%, transparent)`,
                    }}
                  >
                    {mediaKindLabel[item.kind]}
                  </span>
                </div>
                <div className="bg-page/70 p-4">
                  <Image
                    src={asset(item.src)}
                    alt={item.alt}
                    width={1600}
                    height={item.kind === "architecture" ? 960 : 900}
                    unoptimized
                    className={`w-full rounded-xl border border-line bg-page object-cover ${
                      item.kind === "architecture"
                        ? "max-h-[560px]"
                        : "max-h-[420px]"
                    }`}
                  />
                </div>
              </figure>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionLabel n={sectionNum(4)} title="Problem Solving" />
          <p className="mt-2 text-sm text-muted">
            문제를 어떻게 정의했고, 어떤 구조적 판단으로 풀었는지.
          </p>

          <div className="mt-8 space-y-6" data-stagger>
            {meta.problems.map((p, idx) => (
              <article
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-line bg-panel p-6 transition-all hover:border-line-strong sm:p-8"
              >
                <div className="flex items-center gap-4">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold"
                    style={{
                      color: meta.accentColor,
                      background: `color-mix(in srgb, ${meta.accentColor} 12%, transparent)`,
                    }}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <h3 className="font-display text-lg font-semibold leading-tight sm:text-xl">
                    {p.title}
                  </h3>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-line sm:grid-cols-3">
                  <Step
                    label="Problem"
                    body={p.problem}
                    icon="!"
                    iconBg="bg-accent-pink/15"
                    iconText="text-accent-pink"
                  />
                  <Step
                    label="Approach"
                    body={p.approach}
                    icon="→"
                    iconBg="bg-accent-blue/10"
                    iconText="text-accent-blue"
                  />
                  <Step
                    label="Result"
                    body={p.result}
                    icon="✓"
                    iconBg="bg-ink/5"
                    iconText="text-ink"
                  />
                </div>

                {p.evidence && (
                  <div className="mt-4 flex items-center gap-2 font-mono text-xs text-subtle">
                    <span aria-hidden>↗</span>
                    <span>{p.evidence.label}</span>
                  </div>
                )}

                <div
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: meta.accentColor }}
                />
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionLabel n={sectionNum(5)} title="Tech Decisions" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3" data-stagger>
            {meta.techDecisions.map((td, i) => (
              <div
                key={i}
                className="rounded-xl border border-line bg-panel p-5 transition-colors hover:border-line-strong"
              >
                <h4 className="font-mono text-sm font-semibold" style={{ color: meta.accentColor }}>
                  {td.tech}
                </h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {td.why}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <SectionLabel n={sectionNum(6)} title="Retrospective" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" data-stagger>
            <div className="rounded-xl border-l-2 border-accent-pink bg-panel p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-accent-pink">
                Lesson
              </p>
              <p className="mt-3 leading-relaxed">{meta.retrospective.lesson}</p>
            </div>
            <div
              className="rounded-xl border-l-2 bg-panel p-6"
              style={{ borderColor: meta.accentColor }}
            >
              <p className="font-mono text-xs uppercase tracking-wider" style={{ color: meta.accentColor }}>
                Next Time
              </p>
              <p className="mt-3 leading-relaxed">{meta.retrospective.nextTime}</p>
            </div>
          </div>
        </section>

        <footer className="mt-24 flex items-center justify-between border-t border-line pt-8 text-sm">
          <Link
            href="/"
            className="text-muted transition-colors hover:text-ink"
          >
            다른 프로젝트 보기
          </Link>
          <a
            href={profile.contact.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-muted transition-colors hover:text-ink"
          >
            GitHub ↗
          </a>
        </footer>
      </div>
    </div>
  );
}

function Step({
  label,
  body,
  icon,
  iconBg,
  iconText,
}: {
  label: string;
  body: string;
  icon: string;
  iconBg: string;
  iconText: string;
}) {
  return (
    <div className="bg-panel p-5">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-md font-mono text-xs font-bold ${iconBg} ${iconText}`}
          aria-hidden
        >
          {icon}
        </span>
        <span className="font-mono text-xs uppercase tracking-wider text-subtle">
          {label}
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed">{body}</p>
    </div>
  );
}
