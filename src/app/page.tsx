import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { loadAllProjects } from "@/lib/load-project";
import { asset } from "@/lib/asset";
import { MouseGlow } from "@/components/mouse-glow";
import { Reveal } from "@/components/reveal";
import { TechBadge } from "@/components/tech-badge";
import { RadarChart } from "@/components/radar-chart";
import { ScrollProgress } from "@/components/scroll-progress";
import { AnimatedName } from "@/components/animated-name";
import { Tilt } from "@/components/tilt";
import { SideDots } from "@/components/side-dots";
import { profile, awards, experience, education } from "@/data/profile";
import { techStack, skillAxes } from "@/data/tech-stack";

const META_STRIP = [
  { label: "Role", value: "Full-stack Engineer" },
  { label: "Focus", value: "End-to-end systems" },
  { label: "Based", value: "Seoul, KR" },
  { label: "Available", value: "2026.06 +" },
];

const SIDE_NAV = [
  { id: "top", label: "Cover" },
  { id: "about", label: "About" },
  { id: "tech", label: "Tech" },
  { id: "projects", label: "Stories" },
  { id: "experience", label: "Notes" },
  { id: "education", label: "Background" },
  { id: "contact", label: "Contact" },
];

export default async function Home() {
  const projects = await loadAllProjects();

  return (
    <div className="relative">
      <ScrollProgress />
      <SideDots items={SIDE_NAV} />

      {/* Single fixed corner — kept subtle */}
      <div className="page-corner top-right hidden sm:block">
        NO. 04 / 2026
      </div>

      {/* Sticky top nav */}
      <nav className="sticky top-0 z-40 border-b border-line bg-page/75 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-3.5">
          <a
            href="#top"
            className="font-mono text-[11px] uppercase tracking-[0.2em]"
          >
            <span className="text-subtle">Lee </span>
            <span className="text-ink">Jinwon</span>
          </a>
          <ul className="hidden items-center gap-5 text-sm text-muted md:flex">
            <li>
              <a href="#about" className="transition-colors hover:text-ink">
                About
              </a>
            </li>
            <li>
              <a href="#tech" className="transition-colors hover:text-ink">
                Tech
              </a>
            </li>
            <li>
              <a href="#projects" className="transition-colors hover:text-ink">
                Stories
              </a>
            </li>
            <li>
              <a href="#experience" className="transition-colors hover:text-ink">
                Notes
              </a>
            </li>
            <li>
              <a href="#contact" className="transition-colors hover:text-ink">
                Contact
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main id="main" tabIndex={-1} className="relative">
        {/* === FULL-SCREEN HERO === */}
        <MouseGlow>
        <section
          id="top"
          className="relative flex min-h-[calc(100vh-3.5rem)] flex-col justify-center overflow-hidden px-6 py-10 sm:py-14"
        >
          {/* Giant watermark numeral */}
          <span
            aria-hidden
            className="pointer-events-none absolute -right-6 top-6 select-none font-display font-bold leading-none text-ink/[0.045]"
            style={{
              fontSize: "clamp(16rem, 38vw, 36rem)",
              fontVariationSettings: '"opsz" 144, "SOFT" 30, "WONK" 1',
            }}
          >
            04
          </span>

          <div className="relative mx-auto w-full max-w-5xl animate-fade-up">
            {/* Tiny masthead */}
            <div className="flex items-baseline justify-between border-b border-line pb-3 text-[9px] font-mono uppercase tracking-[0.3em] text-subtle">
              <span>The Engineer&apos;s Notes</span>
              <span>Edition 2026 · Vol. 04</span>
            </div>

            <div className="mt-10 grid items-end gap-6 md:grid-cols-[max-content_auto] md:gap-40">
              <div>
                {/* Cover label */}
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-pink">
                    Cover Story
                  </span>
                  <span className="h-px w-16 bg-line" />
                </div>

                {/* Big Korean name as the hero piece */}
                <h1
                  className="mt-8 font-display font-bold leading-[0.95] tracking-tight"
                  style={{
                    fontSize: "clamp(4rem, 11vw, 9rem)",
                  }}
                >
                  <AnimatedName text={profile.name.ko} />
                </h1>
                <p className="mt-3 font-display text-2xl italic text-subtle sm:text-3xl">
                  <span className="ornament mr-3" />
                  {profile.name.en}
                </p>

                <p className="mt-6 max-w-2xl font-display text-xl italic text-muted sm:text-2xl">
                  Edition Four — Building across layers.
                </p>

                <p className="mt-6 font-mono text-sm text-accent-blue">
                  {profile.title}
                </p>

                <div className="mt-8 flex flex-wrap gap-3 text-sm">
                  <a
                    className="rounded-full border border-ink/80 bg-ink px-5 py-2.5 text-page transition-colors hover:bg-accent-blue hover:border-accent-blue"
                    href={`mailto:${profile.contact.email}`}
                  >
                    {profile.contact.email}
                  </a>
                  {profile.contact.github && (
                    <a
                      className="rounded-full border border-line bg-panel px-5 py-2.5 transition-colors hover:border-accent-blue hover:text-accent-blue"
                      href={profile.contact.github}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub ↗
                    </a>
                  )}
                </div>
              </div>

              {/* Cover portrait — page-toned card, sits next to the name */}
              <figure className="hidden self-end md:block md:ml-4 lg:-ml-8">
                <div className="relative w-[320px] overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_22px_50px_-22px_rgba(31,27,23,0.4)] lg:w-[360px]">
                  <Image
                    src={asset("/profile-photo.jpg")}
                    alt={`${profile.name.ko} 증명사진`}
                    width={698}
                    height={804}
                    preload
                    sizes="(min-width: 1024px) 360px, 320px"
                    className="block h-auto w-full"
                  />
                </div>
                <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-subtle">
                  Portrait · 2026
                </figcaption>
              </figure>
            </div>

            {/* Bottom meta strip */}
            <div className="mt-14 grid grid-cols-2 gap-y-4 border-t border-line pt-5 sm:grid-cols-4 sm:gap-x-6">
              {META_STRIP.map((m) => (
                <div key={m.label}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-subtle">
                    {m.label}
                  </p>
                  <p className="mt-1 font-display text-base font-medium">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </section>
        </MouseGlow>

        {/* === BODY === */}
        <div className="mx-auto w-full max-w-5xl px-6 pb-16">
          {/* ABOUT */}
          <Chapter
            id="about"
            n="I"
            label="Chapter"
            title="About"
            direction="right"
          >
            <p className="drop-cap text-lg leading-relaxed">
              {profile.about.summary}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {profile.about.keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full border border-line bg-panel-2/50 px-3 py-1 font-mono text-xs text-muted"
                >
                  #{kw}
                </span>
              ))}
            </div>
            <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-[max-content_1fr]">
              <dt className="font-mono text-xs uppercase tracking-wider text-subtle">
                Role
              </dt>
              <dd>{profile.about.role}</dd>
              <dt className="font-mono text-xs uppercase tracking-wider text-subtle">
                Interest
              </dt>
              <dd>{profile.about.interest}</dd>
              <dt className="font-mono text-xs uppercase tracking-wider text-subtle">
                Motto
              </dt>
              <dd className="font-display italic text-accent-blue">
                &ldquo;{profile.motto.en}&rdquo;
              </dd>
            </dl>
          </Chapter>

          {/* TECH */}
          <Chapter
            id="tech"
            n="II"
            label="Chapter"
            title="Tech Stack"
            eyebrow="프로젝트에서 실제로 손에 익은 도구들."
            direction="left"
          >
            {/* Skill radar — visual centerpiece before the category list */}
            <div className="card-lift mb-6 grid grid-cols-1 gap-6 rounded-2xl border border-line bg-panel p-6 md:grid-cols-[1fr_auto] md:gap-8 md:p-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent-pink">
                  Strength Map
                </p>
                <h3 className="mt-2 font-display text-2xl font-bold leading-tight">
                  어떤 영역에 무게가 실렸나
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  네 개의 프로젝트에서 실제로 손에 익은 정도를 분포로 본 것.
                  절대 점수가 아니라 <em>어디에 시간을 쏟았나</em> 의 그림에 가깝다.
                </p>
                <ul className="mt-5 space-y-1.5 text-xs text-muted">
                  {skillAxes.map((s) => (
                    <li key={s.label} className="flex items-baseline gap-2">
                      <span
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: "var(--accent-pink)" }}
                        aria-hidden
                      />
                      <span className="shrink-0 whitespace-nowrap font-mono uppercase tracking-wider">
                        {s.label}
                      </span>
                      {s.detail && (
                        <span className="text-subtle">— {s.detail}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mx-auto w-full max-w-[460px]">
                <RadarChart data={skillAxes} size={380} />
              </div>
            </div>

            <div className="space-y-5">
              {techStack.map((cat, i) => (
                <Reveal key={cat.name} delay={i * 60} direction={i % 2 ? "left" : "right"}>
                  <Tilt
                    max={3}
                    className="card-lift gradient-border relative rounded-xl border border-line bg-panel p-6"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
                        {cat.name}
                      </h3>
                      {cat.subtitle && (
                        <span className="hidden sm:block text-xs text-subtle">
                          {cat.subtitle}
                        </span>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {cat.items.map((item) => (
                        <TechBadge key={item} name={item} />
                      ))}
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </Chapter>

          {/* STORIES */}
          <Chapter
            id="projects"
            n="III"
            label="Feature"
            title="Stories"
            eyebrow="가장 무게 있게 작업한 네 편의 이야기."
            direction="right"
          >
            <ul className="space-y-6">
              {projects.map(({ meta }, idx) => (
                <Reveal
                  as="li"
                  key={meta.slug}
                  delay={idx * 80}
                  direction={idx % 2 ? "right" : "left"}
                >
                  <Tilt max={4}>
                    <Link
                      href={`/projects/${meta.slug}/`}
                      className="card-lift group relative block overflow-hidden rounded-2xl border border-line bg-panel p-6 sm:p-7"
                      style={{
                        ["--accent" as string]: meta.accentColor,
                      }}
                    >
                      <span
                        className="absolute inset-y-0 left-0 w-1 origin-top scale-y-0 transition-transform duration-500 group-hover:scale-y-100"
                        style={{ background: meta.accentColor }}
                        aria-hidden
                      />

                      <div className="flex items-baseline justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-subtle">
                        <span>Story No. {String(idx + 1).padStart(2, "0")}</span>
                        <span>{meta.period}</span>
                      </div>

                      <ViewTransition
                        name={`project-title-${meta.slug}`}
                        share="morph"
                      >
                        <h3 className="mt-3 font-display text-3xl font-bold tracking-tight transition-colors sm:text-4xl">
                          <span className="group-hover:text-[var(--accent)]">
                            {meta.displayName}
                          </span>
                        </h3>
                      </ViewTransition>

                      <p className="mt-4 max-w-prose leading-relaxed text-muted">
                        {meta.impact}
                      </p>

                      {meta.stats.length > 0 && (
                        <div
                          className={`mt-6 grid gap-2 ${
                            meta.stats.length >= 3
                              ? "grid-cols-2 sm:grid-cols-3"
                              : "grid-cols-2"
                          }`}
                        >
                          {meta.stats.slice(0, 3).map((stat) => (
                            <div
                              key={`${meta.slug}-${stat.label}`}
                              className="rounded-xl border border-line bg-panel-2/40 px-3 py-3"
                            >
                              <p
                                className="font-display text-2xl font-bold"
                                style={{ color: meta.accentColor }}
                              >
                                {stat.value}
                              </p>
                              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-subtle">
                                {stat.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {meta.techStack.slice(0, 6).map((tech) => (
                          <TechBadge key={tech} name={tech} variant="compact" />
                        ))}
                        {meta.techStack.length > 6 && (
                          <span className="rounded-md px-2 py-0.5 font-mono text-[11px] text-subtle">
                            +{meta.techStack.length - 6}
                          </span>
                        )}
                      </div>

                      <div
                        className="mt-6 flex items-center gap-2 font-display italic"
                        style={{ color: meta.accentColor }}
                      >
                        <span>read the story</span>
                        <span
                          aria-hidden
                          className="transition-transform group-hover:translate-x-1"
                        >
                          →
                        </span>
                      </div>
                    </Link>
                  </Tilt>
                </Reveal>
              ))}
            </ul>
          </Chapter>

          {/* NOTES */}
          <Chapter
            id="experience"
            n="IV"
            label="Field"
            title="Notes"
            direction="left"
          >
            <ol className="relative space-y-8 border-l-2 border-line pl-6">
              {experience.map((e, i) => (
                <Reveal as="li" key={i} delay={i * 80} direction="right">
                  <span className="absolute -left-[31px] mt-1.5 h-3 w-3 rounded-full border-2 border-accent-blue bg-page shadow-[0_0_12px_color-mix(in_srgb,var(--accent-blue)_50%,transparent)]" />
                  <p className="font-mono text-xs text-subtle">{e.period}</p>
                  <h3 className="mt-1 font-display text-xl font-semibold">
                    {e.org}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{e.role}</p>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {e.activities.map((a, j) => (
                      <li key={j} className="flex gap-2">
                        <span className="text-accent-blue">·</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ))}
            </ol>
          </Chapter>

          {/* AWARDS */}
          {awards.length > 0 && (
            <Chapter
              id="awards"
              n="V"
              label="Recognition"
              title="Awards"
              direction="right"
            >
              <ul className="space-y-3">
                {awards.map((a, i) => (
                  <Reveal
                    as="li"
                    key={i}
                    delay={i * 60}
                    direction={i % 2 ? "right" : "left"}
                    className="flex items-baseline gap-4 border-b border-line pb-3"
                  >
                    <span className="font-mono text-xs text-subtle">
                      {a.year}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-muted">{a.scope}</p>
                      <p className="font-display text-lg">{a.project}</p>
                    </div>
                    {a.result && (
                      <span className="rounded-full bg-accent-blue/10 px-3 py-1 font-mono text-xs text-accent-blue">
                        {a.result}
                      </span>
                    )}
                  </Reveal>
                ))}
              </ul>
            </Chapter>
          )}

          {/* EDUCATION */}
          <Chapter
            id="education"
            n={awards.length > 0 ? "VI" : "V"}
            label="Background"
            title="Education & Certs"
            direction="left"
          >
            <ul className="space-y-3">
              {education.map((e, i) => (
                <Reveal
                  as="li"
                  key={i}
                  delay={i * 60}
                  direction="right"
                  className="flex items-baseline gap-4 border-b border-line pb-3"
                >
                  <span className="font-mono text-xs uppercase tracking-wider text-subtle">
                    {e.type}
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-base font-medium">
                      {e.title}
                    </p>
                    {e.detail && <p className="text-sm text-muted">{e.detail}</p>}
                  </div>
                  <span className="font-mono text-xs text-accent-blue">
                    {e.status}
                  </span>
                </Reveal>
              ))}
            </ul>
          </Chapter>

          {/* CONTACT */}
          <Chapter
            id="contact"
            n={awards.length > 0 ? "VII" : "VI"}
            label="Colophon"
            title="Contact"
            direction="up"
          >
            <div className="card-lift gradient-border rounded-2xl border border-line bg-panel p-10 text-center">
              <p className="font-display text-2xl italic leading-relaxed">
                새로운 팀, 새로운 문제,
                <br />
                새로운 계층의 통합 —
              </p>
              <p className="mt-4 text-muted">
                어디든 끝에서 끝까지 책임지고 싶습니다.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm">
                <a
                  className="rounded-full border border-ink bg-ink px-6 py-2.5 text-page transition-all hover:bg-accent-blue hover:border-accent-blue hover:shadow-[0_0_24px_color-mix(in_srgb,var(--accent-blue)_50%,transparent)]"
                  href={`mailto:${profile.contact.email}`}
                >
                  Email →
                </a>
                {profile.contact.github && (
                  <a
                    className="rounded-full border border-line bg-panel px-6 py-2.5 transition-colors hover:border-accent-blue hover:text-accent-blue"
                    href={profile.contact.github}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    GitHub ↗
                  </a>
                )}
              </div>
            </div>
          </Chapter>

          <footer className="mt-24 flex items-baseline justify-between border-t-2 border-ink/80 pt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-subtle">
            <span>© {new Date().getFullYear()} Lee Jinwon</span>
            <span>End of Issue · No. 04</span>
          </footer>
        </div>
      </main>
    </div>
  );
}

/**
 * Chapter — sticky-rail section with an editorial label (Chapter / Feature /
 * Field / ...). The `direction` prop controls which side the body slides in
 * from on reveal, letting consecutive sections alternate for rhythm.
 */
function Chapter({
  id,
  n,
  label,
  title,
  eyebrow,
  direction = "up",
  children,
}: {
  id: string;
  n: string;
  label: string;
  title: string;
  eyebrow?: string;
  direction?: "up" | "left" | "right" | "down";
  children: React.ReactNode;
}) {
  return (
    <Reveal as="section" direction={direction} className="mt-28 sm:mt-36">
      <div
        id={id}
        className="scroll-mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10"
      >
        <header className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-subtle">
              {label}
            </span>
            <span className="chapter-mark text-2xl text-accent-blue">{n}</span>
          </div>
          <h2 className="mt-2 font-display text-4xl font-bold leading-[0.95] tracking-tight sm:text-5xl">
            {title}
          </h2>
          {eyebrow && (
            <p className="mt-3 max-w-xs font-display italic text-sm text-muted">
              {eyebrow}
            </p>
          )}
          <span className="mt-5 hidden h-px w-12 bg-accent-blue lg:block" />
        </header>
        <div className="lg:col-span-8">{children}</div>
      </div>
    </Reveal>
  );
}
