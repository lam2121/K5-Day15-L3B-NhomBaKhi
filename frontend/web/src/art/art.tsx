// Hand-drawn tea-party illustrations as inline SVG. All decorative: every
// caller hides them from assistive tech and puts the meaning in text.

const C = {
  strawberry: '#F28076',
  deep: '#B5433A',
  blush: '#FFB6AF',
  blushSoft: '#FFE3DF',
  cream: '#FAE0C7',
  apricot: '#FBC193',
  mint: '#4EB09B',
  mintSoft: '#D6F0E9',
  cocoa: '#4A2C2A',
  line: '#E9CDBB',
  white: '#FFFFFF',
};

type Flavour = { main: string; accent: string; light: string };
const FLAVOURS: Flavour[] = [
  { main: C.strawberry, accent: C.mint, light: C.blush },
  { main: C.mint, accent: C.strawberry, light: C.mintSoft },
  { main: C.apricot, accent: C.strawberry, light: C.cream },
  { main: C.blush, accent: C.mint, light: C.blushSoft },
];

const stroke = { stroke: C.cocoa, strokeWidth: 2.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

function Macaron({ f }: { f: Flavour }) {
  return (
    <g {...stroke}>
      <ellipse cx="60" cy="78" rx="34" ry="8" fill={C.line} stroke="none" />
      <path d="M26 62c0-10 15-16 34-16s34 6 34 16v4H26z" fill={f.main} />
      <rect x="24" y="56" width="72" height="9" rx="4.5" fill={C.cream} />
      <path d="M26 54c0-14 15-24 34-24s34 10 34 24z" fill={f.main} />
      <path d="M38 40c6-4 14-5 20-5" stroke={C.white} strokeWidth="3" opacity=".7" />
    </g>
  );
}

function Cupcake({ f }: { f: Flavour }) {
  return (
    <g {...stroke}>
      <ellipse cx="60" cy="88" rx="30" ry="5" fill={C.line} stroke="none" />
      <path d="M36 56h48l-6 30H42z" fill={f.light} />
      <path d="M48 57l2 28M60 57v28M72 57l-2 28" />
      <path d="M32 56c-4-10 4-16 10-15 0-10 10-15 18-11 8-6 20-1 19 9 7 0 12 8 9 17z" fill={f.main} />
      <path d="M44 46c6 3 18 3 28-2" stroke={C.white} strokeWidth="3" opacity=".6" />
      <circle cx="61" cy="22" r="6" fill={C.strawberry} />
      <path d="M61 16c1-4 4-6 7-6" />
    </g>
  );
}

function Slice({ f }: { f: Flavour }) {
  return (
    <g {...stroke}>
      <ellipse cx="60" cy="86" rx="40" ry="6" fill={C.line} stroke="none" />
      <path d="M22 50 96 36v44H22z" fill={C.cream} />
      <path d="M22 62h74M22 72h74" stroke={f.main} strokeWidth="4" />
      <path d="M22 50 96 36v44H22z" fill="none" />
      <path d="M22 50 96 36 84 30 18 46z" fill={C.white} />
      <path d="M40 41c0-8 10-12 14-4 2 5-3 9-7 9" fill={C.strawberry} />
      <path d="M46 33c1-3 4-5 7-4" stroke={C.mint} />
    </g>
  );
}

function Donut({ f }: { f: Flavour }) {
  return (
    <g {...stroke}>
      <ellipse cx="60" cy="84" rx="34" ry="6" fill={C.line} stroke="none" />
      <ellipse cx="60" cy="58" rx="36" ry="26" fill={C.apricot} />
      <path d="M26 54c2-14 18-22 34-22s32 8 34 22c-3 6-8 2-11 7-4 6-9 0-13 5-5 5-10-2-15 2-5 3-9-4-14-1-5 2-9-5-15-13z" fill={f.main === C.apricot ? C.blush : f.main} />
      <ellipse cx="60" cy="53" rx="10" ry="6" fill="#FFF9F4" />
      <path d="M40 44l4-3M78 42l4 2M70 62l3 3M46 62l-3 3M58 39l4 1" stroke={f.accent} strokeWidth="3" />
    </g>
  );
}

function Tart({ f }: { f: Flavour }) {
  return (
    <g {...stroke}>
      <ellipse cx="60" cy="84" rx="40" ry="6" fill={C.line} stroke="none" />
      <path d="M20 56h80l-6 22H26z" fill={C.apricot} />
      <path d="M28 58l2 18M42 58l1 19M56 58v19M70 58l-1 19M84 58l-2 18" stroke={C.deep} strokeWidth="1.5" opacity=".5" />
      <ellipse cx="60" cy="56" rx="40" ry="9" fill={C.cream} />
      <circle cx="44" cy="52" r="7" fill={C.strawberry} />
      <circle cx="60" cy="49" r="7" fill={f.accent === C.mint ? C.mint : C.blush} />
      <circle cx="76" cy="52" r="7" fill={C.strawberry} />
    </g>
  );
}

function Pudding({ f }: { f: Flavour }) {
  return (
    <g {...stroke}>
      <ellipse cx="60" cy="84" rx="40" ry="6" fill={C.line} stroke="none" />
      <path d="M34 36h52l10 44H24z" fill={C.cream} />
      <path d="M34 36h52l3 12c-4 6-8-2-12 4-4 6-8-3-12 3-5 6-9-3-13 2-5 5-8-3-12 2-4 4-7-2-9-3z" fill={f.main} />
      <path d="M40 30c0-6 5-8 9-6" />
      <circle cx="60" cy="30" r="6" fill={C.strawberry} />
    </g>
  );
}

function Cookie({ f }: { f: Flavour }) {
  return (
    <g {...stroke}>
      <ellipse cx="60" cy="84" rx="34" ry="6" fill={C.line} stroke="none" />
      <path d="M60 28c12-1 22 4 28 14 7 12 3 28-10 35-12 7-30 5-38-6-9-12-7-30 5-38 4-3 9-5 15-5z" fill={C.apricot} />
      <path d="M40 48c3-1 5 1 4 4M70 40c3 0 4 3 2 5M74 62c2-2 5-1 5 2M50 66c2-2 5 0 4 3M60 52c2-2 5 0 4 3" stroke={C.cocoa} strokeWidth="4" />
      <path d="M44 38c4-3 8-4 12-4" stroke={f.main} strokeWidth="4" />
    </g>
  );
}

const SHAPES = [Macaron, Cupcake, Slice, Donut, Tart, Pudding, Cookie];

/** One pastry per slide deck, so each card in the menu looks different. */
export function Pastry({ index, covered = false, className = '' }: { index: number; covered?: boolean; className?: string }) {
  const Shape = SHAPES[index % SHAPES.length];
  const f = FLAVOURS[Math.floor(index / SHAPES.length + index) % FLAVOURS.length];
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true" focusable="false">
      <g opacity={covered ? 0.45 : 1}>
        <Shape f={f} />
      </g>
      {covered && (
        // Glass cloche: this deck is not ready yet.
        <g {...stroke} strokeWidth={2.5}>
          <path d="M16 86c0-36 18-62 44-62s44 26 44 62z" fill="rgba(214,240,233,.45)" />
          <path d="M30 70c0-20 10-34 22-38" stroke={C.white} strokeWidth="4" opacity=".9" />
          <circle cx="60" cy="18" r="6" fill={C.mint} />
          <path d="M10 86h100" />
        </g>
      )}
    </svg>
  );
}

/** Three-tier cake; each of the 14 strawberries is one slide deck. */
export function TieredCake({ ready, className = '' }: { ready: boolean[]; className?: string }) {
  const tiers = [
    { y: 128, x: 20, w: 200, h: 44, berries: 6, fill: C.cream, band: C.strawberry },
    { y: 86, x: 46, w: 148, h: 42, berries: 5, fill: C.blush, band: C.mint },
    { y: 46, x: 76, w: 88, h: 40, berries: 3, fill: C.cream, band: C.apricot },
  ];
  let k = 0;
  return (
    <svg viewBox="0 0 240 190" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="120" cy="178" rx="112" ry="9" fill={C.line} />
      <rect x="8" y="170" width="224" height="8" rx="4" fill={C.white} {...stroke} />
      {tiers.map((t, ti) => {
        const spots = Array.from({ length: t.berries }, (_, i) => t.x + ((i + 0.5) * t.w) / t.berries);
        return (
          <g key={ti} {...stroke}>
            <rect x={t.x} y={t.y} width={t.w} height={t.h} rx="10" fill={t.fill} />
            <path
              d={`M${t.x} ${t.y + 14} ${Array.from({ length: 8 }, (_, i) => {
                const step = t.w / 8;
                const x = t.x + step * (i + 1);
                return `Q${x - step / 2} ${t.y + 26} ${x} ${t.y + 14}`;
              }).join(' ')}`}
              fill="none"
              stroke={t.band}
              strokeWidth="5"
            />
            {spots.map((cx) => {
              const on = ready[k++] ?? false;
              const cy = t.y - 2;
              return on ? (
                <g key={cx}>
                  <path d={`M${cx} ${cy + 8}c-8-2-10-10-6-14 3-3 9-3 12 0 4 4 2 12-6 14z`} fill={C.strawberry} />
                  <path d={`M${cx - 4} ${cy - 5}l4 2 4-2`} stroke={C.mint} />
                </g>
              ) : (
                <circle key={cx} cx={cx} cy={cy} r="6" fill={C.white} strokeDasharray="3 3" />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

/** Teapot pouring into a cup: the "generating" state. */
export function TeaPour({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 170" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="150" cy="158" rx="46" ry="6" fill={C.line} />
      <g className="origin-[150px_110px]">
        <path d="M116 108h68v14a30 30 0 0 1-30 30h-8a30 30 0 0 1-30-30z" fill={C.white} {...stroke} />
        <clipPath id="cup-clip">
          <path d="M118 110h64v12a28 28 0 0 1-28 28h-8a28 28 0 0 1-28-28z" />
        </clipPath>
        <g clipPath="url(#cup-clip)">
          <rect x="112" y="108" width="76" height="46" fill={C.apricot} className="animate-fill origin-bottom [transform-box:fill-box]" />
        </g>
        <path d="M184 116h6a10 10 0 0 1 0 20h-8" fill="none" {...stroke} />
        <path d="M140 98c-3-6 3-9 0-15M156 98c-3-6 3-9 0-15" fill="none" stroke={C.mint} strokeWidth="3" strokeLinecap="round" className="animate-steam" />
      </g>
      <path d="M118 84c-2 10-2 18 0 24" stroke={C.apricot} strokeWidth="5" strokeLinecap="round" fill="none" opacity=".9" />
      <g className="animate-pour origin-[70px_90px]">
        <path d="M30 70c0-20 18-32 40-32s40 12 40 32v12c0 14-14 22-40 22S30 96 30 82z" fill={C.strawberry} {...stroke} />
        <path d="M108 70c8-4 12-10 14-14" fill="none" {...stroke} strokeWidth="5" />
        <path d="M108 70c8-4 12-10 14-14" fill="none" stroke={C.strawberry} strokeWidth="2" />
        <path d="M30 66c-14-2-18 18-2 22" fill="none" {...stroke} strokeWidth="4" />
        <path d="M44 38c4-8 48-8 52 0" fill={C.blush} {...stroke} />
        <circle cx="70" cy="28" r="7" fill={C.mint} {...stroke} />
        <circle cx="52" cy="72" r="4" fill={C.white} />
        <circle cx="70" cy="78" r="4" fill={C.white} />
        <circle cx="88" cy="72" r="4" fill={C.white} />
      </g>
    </svg>
  );
}

export type MacaronState = 'empty' | 'answered' | 'missing' | 'correct' | 'wrong';

/** Progress dot shaped like a macaron. The current question is marked by its button. */
export function MiniMacaron({ state }: { state: MacaronState }) {
  const fill = { empty: C.white, answered: C.strawberry, missing: C.apricot, correct: C.mint, wrong: C.blushSoft }[state];
  const dashed = state === 'empty';
  return (
    <svg viewBox="0 0 40 32" className="h-full w-full" aria-hidden="true" focusable="false">
      <g stroke={C.cocoa} strokeWidth="2" strokeLinejoin="round" strokeDasharray={dashed ? '3 2.5' : undefined}>
        <path d="M5 19c0-3 7-5 15-5s15 2 15 5v3H5z" fill={fill} />
        <rect x="4" y="15" width="32" height="5" rx="2.5" fill={state === 'wrong' ? C.white : C.cream} />
        <path d="M5 14c0-6 7-10 15-10s15 4 15 10z" fill={fill} />
      </g>
      {state === 'wrong' && <path d="M15 8l10 10M25 8 15 18" stroke={C.deep} strokeWidth="2.5" strokeLinecap="round" />}
      {state === 'correct' && <path d="m14 13 4 4 8-8" stroke={C.cocoa} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

/** Top view of a round cake cut into one slice per question. */
export function ScoreCake({ results, className = '' }: { results: boolean[]; className?: string }) {
  const n = Math.max(results.length, 1);
  const r = 80;
  const cx = 100;
  const cy = 100;
  const point = (a: number, rad = r) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      <circle cx={cx} cy={cy + 4} r={r + 14} fill={C.line} />
      <circle cx={cx} cy={cy} r={r + 12} fill={C.white} stroke={C.cocoa} strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke={C.blush} strokeWidth="3" strokeDasharray="2 6" strokeLinecap="round" />
      {results.map((ok, i) => {
        const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
        const [x0, y0] = point(a0);
        const [x1, y1] = point(a1);
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const mid = (a0 + a1) / 2;
        const [bx, by] = point(mid, r * 0.62);
        const d = n === 1 ? undefined : `M${cx} ${cy}L${x0} ${y0}A${r} ${r} 0 ${large} 1 ${x1} ${y1}z`;
        return (
          <g key={i}>
            {n === 1 ? (
              <circle cx={cx} cy={cy} r={r} fill={ok ? C.cream : C.white} stroke={C.cocoa} strokeWidth="2.5" strokeDasharray={ok ? undefined : '5 4'} />
            ) : (
              <path d={d} fill={ok ? (i % 2 ? C.blush : C.cream) : C.white} stroke={C.cocoa} strokeWidth="2.5" strokeLinejoin="round" strokeDasharray={ok ? undefined : '5 4'} />
            )}
            {ok ? (
              <g transform={`translate(${n === 1 ? cx : bx} ${n === 1 ? cy : by})`}>
                <path d="M0 7c-7-2-9-9-5-12 3-3 8-3 10 0 4 3 2 10-5 12z" fill={C.strawberry} stroke={C.cocoa} strokeWidth="1.8" />
                <path d="M-3-5l3 2 3-2" stroke={C.mint} strokeWidth="2" fill="none" strokeLinecap="round" />
              </g>
            ) : (
              <g transform={`translate(${n === 1 ? cx : bx} ${n === 1 ? cy : by})`} fill={C.apricot}>
                <circle cx="-4" cy="0" r="1.8" />
                <circle cx="3" cy="-3" r="1.4" />
                <circle cx="2" cy="4" r="1.6" />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Small teacup used as the logo mark. */
export function TeacupMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" className={className} aria-hidden="true" focusable="false">
      <path d="M6 14h22v6a10 10 0 0 1-10 10h-2A10 10 0 0 1 6 20z" fill={C.strawberry} stroke={C.cocoa} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M28 16h3a4 4 0 0 1 0 8h-4" fill="none" stroke={C.cocoa} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M3 32h30" stroke={C.cocoa} strokeWidth="2.2" strokeLinecap="round" />
      <path d="M13 3c-2 3 2 4 0 8M20 3c-2 3 2 4 0 8" stroke={C.mint} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M11 18c2 0 3 2 5 2" stroke={C.white} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

/** Mixing bowl and whisk: the admin "kitchen" mark. */
export function WhiskMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" className={className} aria-hidden="true" focusable="false">
      <path d="M24 4 15 18" stroke={C.cocoa} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16 18c-2-6 2-12 8-12s6 6 2 12" fill="none" stroke={C.mint} strokeWidth="2.2" />
      <path d="M4 18h32c0 8-7 14-16 14S4 26 4 18z" fill={C.apricot} stroke={C.cocoa} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M10 22c3 2 6 3 10 3" stroke={C.white} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}
