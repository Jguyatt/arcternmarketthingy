import React, { useMemo } from 'react';
import { useInferenceCostInputs, fmt2 } from '../inferenceCostShared';

type ThesisProps = {
  onNavigateStage?: (view: 'inferenceCost' | 'grid') => void;
};

const CITATIONS = {
  goldman:
    'https://finance.yahoo.com/sectors/technology/articles/goldman-says-consensus-2027-hyperscaler-140152065.html',
  wedbush:
    'https://investor.wedbush.com/wedbush/article/tokenring-2026-1-21-the-scarcest-resource-in-ai-hbm4-memory-sold-out-through-2026-as-hyperscalers-lock-in-2048-bit-future',
  trendforce: 'https://www.trendforce.com/insights/memory-wall',
  primary: 'https://arctern-rcvc.vercel.app',
} as const;

const CITATION_GROUPS: {
  title: string;
  items: { title: string; href: string }[];
}[] = [
  {
    title: 'Capex & Buildout',
    items: [
      {
        title: 'The AI Capex Cycle: $725B Hyperscaler Buildout',
        href: 'https://alcapitaladvisory.com/research/intelligence/ai-infrastructure.html',
      },
      {
        title: 'Data Center Investment in 2026: AI Demand, Power Constraints, Private Equity',
        href: 'https://www.ropesgray.com/en/insights/viewpoints/102mvfl/data-center-investment-in-2026-ai-demand-power-constraints-and-private-equity',
      },
      {
        title: 'Goldman: consensus 2027 hyperscaler capex estimates are too conservative',
        href: CITATIONS.goldman,
      },
    ],
  },
  {
    title: 'Custom Silicon & Market Share',
    items: [
      {
        title: 'The custom AI ASIC state of play (May 2026)',
        href: 'https://www.tomshardware.com/tech-industry/semiconductors/custom-ai-asics-examined-from-broadcom-to-mtia',
      },
      {
        title: 'Hyperscaler Custom AI Chips 2026: Trainium 3, TPU, Maia 200, MTIA',
        href: 'https://www.spheron.network/blog/hyperscaler-custom-ai-chips-2026-trainium-tpu-maia-mtia-vs-nvidia-gpu',
      },
      {
        title: 'Custom Silicon Inflection 2026',
        href: 'https://introl.com/blog/custom-silicon-inflection-2026-hyperscaler-asics-nvidia-gpu',
      },
    ],
  },
  {
    title: 'Memory & HBM Supply',
    items: [
      {
        title: 'HBM4 Memory Sold Out Through 2026',
        href: CITATIONS.wedbush,
      },
      {
        title: 'Memory Wall Bottleneck: AI Compute Sparks Memory Supercycle',
        href: CITATIONS.trendforce,
      },
      {
        title: 'AI memory is sold out, causing an unprecedented surge in prices',
        href: 'https://www.cnbc.com/2026/01/10/micron-ai-memory-shortage-hbm-nvidia-samsung.html',
      },
    ],
  },
  {
    title: 'Interconnect & Photonics',
    items: [
      {
        title: 'Scaling AI Factories with Co-Packaged Optics for Better Power Efficiency',
        href: 'https://resources.nvidia.com/en-us-accelerated-networking-resource-library/scaling-ai-factories-with-co-packaged-optics-for-better-power-efficiency',
      },
      {
        title: 'AI Data Center Interconnect 2026: CPO and Deployment Challenges',
        href: 'https://adtek-fiber.com/ai-data-center-interconnect-2026-cpo-and-deployment-challenges',
      },
      {
        title: 'Inside optical and the battle for scale: racing to integrate photonic interconnects',
        href: 'https://www.tomshardware.com/tech-industry/inside-optical-and-the-battle-for-scale-how-the-ai-industry-is-racing-to-integrate-photonic-interconnects',
      },
    ],
  },
];

const FORCE_POINTS = [
  {
    n: '1',
    title: 'Efficiency is the new axis of competition, not raw FLOPS',
    body: "NVIDIA's own roadmap proves it: Hopper (monolithic) → Blackwell (dual-die, fused by a 10 TB/s bridge) → Rubin (2026, rack-scale — the whole rack becomes one computer). Each step removes data movement rather than adding compute. TPU's systolic array and Groq's deterministic dataflow chase the same goal.",
  },
  {
    n: '2',
    title: 'Depreciation and utilization decide the economics — not the power deal',
    body: "RCVC's own PPA/inference model shows electricity is a rounding error next to hardware depreciation. The winners will be whoever compounds better $/token economics — chip cost, useful life, utilization — not whoever has the cheapest power contract.",
  },
  {
    n: '3',
    title: 'The compute stack is fragmenting, and hyperscalers are vertically integrating',
    body: "Merchant GPU share has slipped from ~92% (2023) to ~80–85% (2026) as Google, AWS, Microsoft and Meta scale custom silicon. Meanwhile specialized inference and edge architectures are carving out workload-specific niches GPUs weren't built for.",
  },
];

const LENS_ITEMS = [
  {
    title: 'Interconnect & packaging',
    body: 'Chiplet bridges, optical/CPO, high-radix switching. Wins regardless of whose chip sits in the rack — the direct beneficiary of the memory-bandwidth bottleneck.',
  },
  {
    title: 'Purpose-built inference silicon',
    body: 'Deterministic, dataflow architectures beat general-purpose GPUs on $/token for stable, high-volume inference as that workload overtakes training.',
  },
  {
    title: 'Compiler & software layer',
    body: 'The real unlock for any non-GPU architecture (FPGA, wafer-scale, analog). A durable bet that pays off independent of which silicon ultimately wins.',
  },
  {
    title: 'Power & facility infrastructure',
    body: "Necessary, but our own cost model shows it's ~7% of cost per token. A timing and siting gate, not a source of differentiated returns.",
  },
  {
    title: 'Physics-based optionality',
    body: 'Photonic, analog and neuromorphic compute claim 10–1,000x efficiency gains. Early-stage, venture-sized bets on a paradigm shift, not core positions.',
  },
];

const WATCH_ITEMS = [
  "Rubin's rack-scale launch and HBM4 allocation (SK Hynix ~60–70%) — memory supply is becoming the rationing mechanism for who can build at scale.",
  'Hyperscaler custom-silicon share: a move meaningfully past ~20% would structurally derate merchant-GPU economics.',
  'Whether 5-year GPU depreciation assumptions hold — utilization and useful life are the real swing factor on margin, per our own cost model.',
  'Power and interconnection queues: 30–50% of planned 2026 data center capacity is already slipping to 2028.',
  'Whether a credible software/compiler layer emerges for non-GPU silicon — likely the single biggest swing factor for a real Nvidia challenger.',
];

const SourceLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-zinc-500 hover:text-[#D1623C] transition-colors underline decoration-zinc-700 underline-offset-2"
  >
    {children}
  </a>
);

export const Thesis: React.FC<ThesisProps> = ({ onNavigateStage }) => {
  const { result } = useInferenceCostInputs();

  const costMix = useMemo(() => {
    const a = result.h100;
    const b = result.h200;
    const avg = (x: number, y: number) => (x + y) / 2;
    const hardware = avg(a.hardwarePctOfTotal, b.hardwarePctOfTotal);
    const power = avg(a.electricityPctOfTotal, b.electricityPctOfTotal);
    const cooling = avg(a.coolingPctOfTotal, b.coolingPctOfTotal);
    const costH = a.costTotalPerMillionTokens;
    const costW = b.costTotalPerMillionTokens;
    const lo = Math.min(costH, costW);
    const hi = Math.max(costH, costW);
    return {
      hardware,
      power,
      cooling,
      label:
        Math.abs(hi - lo) < 0.002
          ? `≈ $${fmt2(lo)}`
          : `≈ $${fmt2(lo)}–${fmt2(hi)}`,
    };
  }, [result]);

  const bars = [
    { label: 'Depreciation', pct: costMix.hardware, accent: true },
    { label: 'Power', pct: costMix.power, accent: false },
    { label: 'Cooling', pct: costMix.cooling, accent: false },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-24 pb-24" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Section 1 */}
      <section className="space-y-10">
        <header className="space-y-3 border-b border-zinc-800/50 pb-10">
          <p className="text-xs font-mono uppercase tracking-[0.35em] text-zinc-500">Stage 3 · Thesis</p>
          <h1 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-tight">
            What&apos;s Changing — And Why It{' '}
            <span className="font-semibold text-[#D1623C]">Matters Now</span>
          </h1>
          <p className="text-base text-zinc-400 max-w-3xl leading-relaxed italic">
            Three forces are resetting how AI compute creates and captures value.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-6 space-y-4">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#D1623C] font-semibold leading-snug">
              Modeled cost {costMix.label} / M tokens
            </p>
            <div className="space-y-3 pt-1">
              {bars.map((b) => (
                <div key={b.label} className="space-y-1">
                  <div className="flex justify-between text-xs text-zinc-400">
                    <span>{b.label}</span>
                    <span className="tabular-nums font-mono text-zinc-300">{Math.round(b.pct * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-800/80 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        b.accent ? 'bg-[#D1623C]' : 'bg-zinc-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(2, b.pct * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-zinc-600 pt-1">
              Live from Stage 2 model (avg H100 / H200).{' '}
              {onNavigateStage && (
                <button
                  type="button"
                  onClick={() => onNavigateStage('inferenceCost')}
                  className="text-zinc-500 hover:text-[#D1623C] underline underline-offset-2"
                >
                  Open model
                </button>
              )}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-6 flex flex-col justify-between">
            <div>
              <p className="text-4xl font-semibold text-[#D1623C] tracking-tight tabular-nums">$1.15T</p>
              <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                projected hyperscaler AI capex, 2025–27E — 2.4× the prior three years.
              </p>
            </div>
            <div className="mt-4">
              <SourceLink href={CITATIONS.goldman}>Goldman Sachs</SourceLink>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-6 flex flex-col justify-between">
            <div>
              <p className="text-4xl font-semibold text-[#D1623C] tracking-tight">Sold out</p>
              <p className="text-sm text-zinc-400 mt-3 leading-relaxed">
                HBM4 capacity is fully pre-sold for 2026 across SK Hynix, Samsung and Micron.
              </p>
            </div>
            <div className="mt-4 flex gap-3 flex-wrap">
              <SourceLink href={CITATIONS.wedbush}>Wedbush</SourceLink>
              <SourceLink href={CITATIONS.trendforce}>TrendForce</SourceLink>
            </div>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          {FORCE_POINTS.map((p) => (
            <div key={p.n} className="flex gap-5 items-start">
              <div className="flex-shrink-0 w-10 h-10 rounded-full border border-zinc-700 bg-zinc-900/80 flex items-center justify-center text-sm font-semibold text-[#D1623C]">
                {p.n}
              </div>
              <div className="space-y-1.5 pt-0.5">
                <h3 className="text-base font-semibold text-white tracking-tight">{p.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2 */}
      <section className="space-y-10 border-t border-zinc-800/50 pt-16">
        <header className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">
            Where To <span className="font-semibold text-[#D1623C]">Look</span>
          </h2>
          <p className="text-base text-zinc-400 max-w-3xl leading-relaxed italic">
            An investment lens across the stack, and what to track over the next 2–3 years.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#D1623C]">Investment lens</p>
            <div className="space-y-5">
              {LENS_ITEMS.map((item, i) => (
                <div key={item.title} className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-zinc-700 bg-zinc-900/60 flex items-center justify-center text-[10px] font-mono text-zinc-400">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-6 md:p-8 space-y-5 h-fit">
            <div>
              <p className="text-xs font-mono uppercase tracking-[0.25em] text-[#D1623C] font-semibold">
                What ArcTern Should Watch
              </p>
              <p className="text-sm text-zinc-400 italic mt-2">2026–2028</p>
            </div>
            <ul className="space-y-4">
              {WATCH_ITEMS.map((text) => (
                <li key={text.slice(0, 48)} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                  <span className="text-[#D1623C] flex-shrink-0 mt-0.5 font-mono">{'>'}</span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      {/* Section 3 — Citations */}
      <section id="citations" className="space-y-10 border-t border-zinc-800/50 pt-16">
        <header className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight">
            <span className="font-semibold text-[#D1623C]">Citation</span>
          </h2>
          <p className="text-base text-zinc-400 max-w-3xl leading-relaxed italic">
            Sources underpinning the analysis, by theme.
          </p>
        </header>

        <div className="rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-6 md:p-8 flex gap-4 items-start">
          <div className="w-1 self-stretch rounded-full bg-[#D1623C] flex-shrink-0" />
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-[0.25em] text-zinc-500">Primary source</p>
            <p className="text-sm text-white leading-relaxed">
              RCVC Venture Research Group — &ldquo;Chip Topology Research&rdquo; and &ldquo;Inference Cost Model — PPA &amp;
              Prefill&rdquo;
            </p>
            <a
              href={CITATIONS.primary}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-[#D1623C] hover:underline underline-offset-2"
            >
              arctern-rcvc.vercel.app
            </a>
            <p className="text-xs text-zinc-600">Basis for all architecture content on this site.</p>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {CITATION_GROUPS.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-[0.25em] text-[#D1623C] border-b border-zinc-800/60 pb-2">
                {group.title}
              </h3>
              <ul className="space-y-4">
                {group.items.map((item) => (
                  <li key={item.href} className="space-y-1">
                    <p className="text-sm text-white font-medium leading-snug">{item.title}</p>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-500 hover:text-[#D1623C] transition-colors break-all underline decoration-zinc-800 underline-offset-2"
                    >
                      {item.href.replace(/^https?:\/\//, '')}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
