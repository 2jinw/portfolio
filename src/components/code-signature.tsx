export function CodeSignature() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-panel font-mono text-[13px] leading-7 sm:text-sm">
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-line px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
        <span className="ml-2 text-[11px] text-subtle">jinwon.ts</span>
      </div>

      {/* Code */}
      <div className="p-5 sm:p-6">
        <Line>
          <K>async function</K> <F>deliver</F>
          <P>{"() {"}</P>
        </Line>
        <Line indent={1}>
          <K>try</K> <P>{"{"}</P>
        </Line>
        <Line indent={2}>
          <K>await</K> <F>build</F>
          <P>(</P>
          <S>&quot;app&quot;</S>
          <P>);</P>
        </Line>
        <Line indent={2}>
          <K>await</K> <F>build</F>
          <P>(</P>
          <S>&quot;backend&quot;</S>
          <P>);</P>
        </Line>
        <Line indent={2}>
          <K>await</K> <F>build</F>
          <P>(</P>
          <S>&quot;device&quot;</S>
          <P>);</P>
        </Line>
        <Line indent={1}>
          <P>{"} "}</P>
          <K>catch</K> <P>(gap) {"{"}</P>
        </Line>
        <Line indent={2}>
          <F>bridge</F>
          <P>(gap);</P>
          <C>{" // 계층 사이의 틈을 메운다"}</C>
        </Line>
        <Line indent={1}>
          <P>{"} "}</P>
          <K>finally</K> <P>{"{"}</P>
        </Line>
        <Line indent={2}>
          <F>integrate</F>
          <P>();</P>
          <span className="ml-0.5 inline-block h-4 w-1.5 translate-y-0.5 bg-accent-blue animate-blink" />
        </Line>
        <Line indent={1}>
          <P>{"}"}</P>
        </Line>
        <Line>
          <P>{"}"}</P>
        </Line>
      </div>
    </div>
  );
}

function Line({
  children,
  indent = 0,
}: {
  children: React.ReactNode;
  indent?: number;
}) {
  return (
    <div style={{ paddingLeft: `${indent * 1.25}rem` }}>{children}</div>
  );
}

// Token color shortcuts (uses .tok-* classes defined in globals.css)
const K = ({ children }: { children: React.ReactNode }) => (
  <span className="tok-kw">{children}</span>
);
const F = ({ children }: { children: React.ReactNode }) => (
  <span className="tok-fn">{children}</span>
);
const S = ({ children }: { children: React.ReactNode }) => (
  <span className="tok-str">{children}</span>
);
const P = ({ children }: { children: React.ReactNode }) => (
  <span className="tok-punc">{children}</span>
);
const C = ({ children }: { children: React.ReactNode }) => (
  <span className="tok-cmt">{children}</span>
);
