// Hand-drawn tea-party illustrations as inline SVG, in a soft sticker style:
// outlines tinted from each fill (never black), a slight hand wobble, seeds,
// highlights and sparkles. Original drawings; all decorative, so every caller
// hides them from assistive tech and puts the meaning in text.
import { useId, type ReactNode } from 'react';

const F = {
  berry: '#F28076',
  blush: '#FFB6AF',
  blushSoft: '#FFE3DF',
  cream: '#FAE0C7',
  creamSoft: '#FFF4E8',
  apricot: '#FBC193',
  mint: '#4EB09B',
  mintSoft: '#D6F0E9',
  white: '#FFFFFF',
  milk: '#FFFBF7',
};
// Outline colours: a deeper shade of the fill they surround.
const L = {
  berry: '#D65A51',
  pink: '#E0847C',
  crust: '#C98C66',
  mint: '#35917D',
  soft: '#E9B9A8',
};

const line = (color: string, width = 2.4) => ({ stroke: color, strokeWidth: width, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const });

/** Wraps a drawing in an SVG with a light hand-drawn wobble. */
function Sheet({ viewBox, className, children }: { viewBox: string; className?: string; children: ReactNode }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true" focusable="false">
      <defs>
        <filter id={`w${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="1.8" />
        </filter>
      </defs>
      <g filter={`url(#w${id})`}>{children}</g>
    </svg>
  );
}

/** Four-point sparkle. */
export function Spark({ x, y, r = 5, color = F.blush }: { x: number; y: number; r?: number; color?: string }) {
  const k = r * 0.28;
  return <path d={`M${x} ${y - r}Q${x + k} ${y - k} ${x + r} ${y}Q${x + k} ${y + k} ${x} ${y + r}Q${x - k} ${y + k} ${x - r} ${y}Q${x - k} ${y - k} ${x} ${y - r}z`} fill={color} />;
}

/** A strawberry with seeds, leaves and a highlight. Centre (x, y), height about 30*s. */
export function Berry({ x, y, s = 1, leaves = true }: { x: number; y: number; s?: number; leaves?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0-9C8-12 15-6 12 3 9 11 3 15 0 16-3 15-9 11-12 3-15-6-8-12 0-9z" fill={F.berry} {...line(L.berry, 2.2)} />
      {[[-5, -2], [1, -4], [6, 0], [-2, 4], [4, 7], [-6, 6], [0, 10]].map(([sx, sy]) => (
        <ellipse key={`${sx}${sy}`} cx={sx} cy={sy} rx="0.9" ry="1.4" fill={F.blushSoft} />
      ))}
      <ellipse cx="-6" cy="-3" rx="2" ry="3.4" fill={F.white} opacity=".75" transform="rotate(25 -6 -3)" />
      {leaves && (
        <path d="M0-8-6-13-2-12.5 0-17 2-12.5 6-13zM0-12.5V-18" fill={F.mint} {...line(L.mint, 1.6)} />
      )}
    </g>
  );
}

function Plate({ y = 86, rx = 40 }: { y?: number; rx?: number }) {
  return <ellipse cx="60" cy={y} rx={rx} ry="5" fill={F.blushSoft} />;
}

/* ---------- pastries ---------- */

function ShortcakeSlice() {
  return (
    <g>
      <Plate />
      <path d="M18 52 98 36v42c0 3-2 5-5 5H23c-3 0-5-2-5-5z" fill={F.cream} {...line(L.crust)} />
      <path d="M19 63 97 52M19 72l78-10" stroke={F.white} strokeWidth="5" strokeLinecap="round" />
      <g>
        <path d="M30 60c0-6 9-6 9 0 0 5-9 5-9 0zM54 56c0-6 9-6 9 0 0 5-9 5-9 0zM78 52c0-6 9-6 9 0 0 5-9 5-9 0z" fill={F.berry} {...line(L.berry, 1.6)} />
      </g>
      <path d="M18 52 98 36 90 30c-2-1-4-1-6 0L20 45c-3 1-3 5-2 7z" fill={F.white} {...line(L.soft)} />
      <path d="M26 46c3-4 7-4 9 0 3-4 7-4 9-1 3-4 7-3 9 0" fill="none" {...line(L.soft, 2)} />
      <Berry x={66} y={28} s={0.75} />
      <Spark x={104} y={22} r={4} />
      <Spark x={14} y={34} r={3} color={F.apricot} />
    </g>
  );
}

function Macaron() {
  return (
    <g>
      <Plate rx={34} />
      <path d="M26 60c0-6 15-9 34-9s34 3 34 9v6c0 6-15 10-34 10s-34-4-34-10z" fill={F.blush} {...line(L.pink)} />
      <path d="M28 62c4 2 8 0 10 2s6 0 9 2 7-1 10 1 7-1 10 1 6-1 9 1 7-2 10 0" fill="none" {...line(L.pink, 1.4)} />
      <path d="M24 54c0-3 16-6 36-6s36 3 36 6-16 7-36 7-36-4-36-7z" fill={F.creamSoft} {...line(L.soft, 2)} />
      <path d="M26 52c0-12 15-21 34-21s34 9 34 21c0 3-15 5-34 5s-34-2-34-5z" fill={F.blush} {...line(L.pink)} />
      <path d="M28 53c4-2 8 0 10-2s6 0 9-2 7 1 10-1 7 1 10-1 6 1 9-1 7 2 10 0" fill="none" {...line(L.pink, 1.4)} />
      <ellipse cx="44" cy="39" rx="9" ry="3" fill={F.white} opacity=".7" transform="rotate(-12 44 39)" />
      <Spark x={100} y={30} r={4} />
    </g>
  );
}

function BigBerry() {
  return (
    <g>
      <Plate rx={28} />
      <Berry x={60} y={52} s={1.95} />
      <Spark x={92} y={30} r={4.5} />
      <Spark x={26} y={68} r={3} color={F.apricot} />
    </g>
  );
}

function Parfait() {
  return (
    <g>
      <Plate rx={30} />
      <path d="M38 40h44v38c0 5-4 8-9 8H47c-5 0-9-3-9-8z" fill={F.white} opacity=".9" {...line(L.soft)} />
      <path d="M40 66h40v12c0 4-3 6-7 6H47c-4 0-7-2-7-6z" fill={F.apricot} />
      <path d="M40 56h40v10H40z" fill={F.creamSoft} />
      <path d="M42 58c0-5 8-5 8 0s-8 5-8 0zM70 58c0-5 8-5 8 0s-8 5-8 0z" fill={F.berry} {...line(L.berry, 1.4)} />
      <path d="M40 46h40v10H40z" fill={F.blush} />
      <path d="M38 40h44v38c0 5-4 8-9 8H47c-5 0-9-3-9-8z" fill="none" {...line(L.soft)} />
      <path d="M44 46v30" stroke={F.white} strokeWidth="3" strokeLinecap="round" opacity=".9" />
      <path d="M36 40c0-6 6-8 10-6 2-6 10-7 14-3 4-4 12-3 14 3 4-2 10 0 10 6z" fill={F.white} {...line(L.soft)} />
      <Berry x={60} y={26} s={0.8} />
      <Spark x={92} y={44} r={4} />
    </g>
  );
}

function MilkCarton() {
  return (
    <g>
      <Plate rx={30} />
      <path d="M38 38h44v44c0 2-2 4-4 4H42c-2 0-4-2-4-4z" fill={F.blushSoft} {...line(L.pink)} />
      <path d="M38 38 46 24h28l8 14z" fill={F.white} {...line(L.pink)} />
      <path d="M46 24 50 16h20l4 8" fill={F.blush} {...line(L.pink)} />
      <rect x="44" y="48" width="32" height="18" rx="6" fill={F.white} {...line(L.pink, 1.8)} />
      <Berry x={52} y={57} s={0.45} />
      <Berry x={66} y={58} s={0.45} />
      <path d="M44 74h22" {...line(L.pink, 2)} />
      <circle cx="74" cy="31" r="3" fill={F.berry} />
      <Spark x={94} y={30} r={4} />
    </g>
  );
}

function Cupcake() {
  return (
    <g>
      <Plate rx={30} />
      <path d="M36 56h48l-6 28c0 2-2 3-4 3H46c-2 0-4-1-4-3z" fill={F.mintSoft} {...line(L.mint)} />
      <path d="M48 58l2 27M60 58v27M72 58l-2 27" {...line(L.mint, 1.6)} />
      <path d="M32 57c-3-8 3-14 9-13 0-9 9-14 17-10 7-6 19-2 19 7 7-1 13 6 10 15z" fill={F.white} {...line(L.soft)} />
      <path d="M40 50c6 4 16 4 28-1M46 42c4 2 9 2 14 0" fill="none" {...line(L.soft, 1.8)} />
      <circle cx="44" cy="48" r="1.6" fill={F.berry} />
      <circle cx="72" cy="46" r="1.6" fill={F.apricot} />
      <circle cx="58" cy="52" r="1.6" fill={F.mint} />
      <Berry x={60} y={26} s={0.75} />
      <Spark x={94} y={40} r={4} />
    </g>
  );
}

function Donut() {
  return (
    <g>
      <Plate rx={34} />
      <ellipse cx="60" cy="60" rx="34" ry="22" fill={F.apricot} {...line(L.crust)} />
      <path d="M28 56c1-12 15-19 32-19s31 7 32 19c-3 5-7 1-10 5-3 5-8 0-11 4-4 4-9-1-12 2-4 3-8-3-12 0-4 2-8-4-12-5-3-1-5-2-7-6z" fill={F.blush} {...line(L.pink)} />
      <ellipse cx="60" cy="55" rx="9" ry="5" fill={F.milk} {...line(L.pink, 2)} />
      {[[40, 48, 30], [50, 42, -20], [72, 44, 40], [80, 52, -30], [46, 60, 60], [70, 62, -50]].map(([x, y, a]) => (
        <rect key={`${x}${y}`} x={x - 3} y={y - 1} width="6" height="2.2" rx="1.1" fill={a > 0 ? F.white : F.mint} transform={`rotate(${a} ${x} ${y})`} />
      ))}
      <Spark x={100} y={36} r={4} />
    </g>
  );
}

const SHAPES = [ShortcakeSlice, Macaron, Cupcake, BigBerry, Parfait, Donut, MilkCarton];

/** One pastry per slide deck, so each card on the menu looks different. */
export function Pastry({ index, covered = false, className = '' }: { index: number; covered?: boolean; className?: string }) {
  const Shape = SHAPES[index % SHAPES.length];
  return (
    <Sheet viewBox="0 0 120 100" className={className}>
      <g opacity={covered ? 0.5 : 1}>
        <Shape />
      </g>
      {covered && (
        // Glass cloche: this deck is not ready yet.
        <g>
          <path d="M18 86c0-34 18-58 42-58s42 24 42 58z" fill="rgba(214,240,233,.55)" {...line(L.mint)} />
          <path d="M32 70c0-18 9-31 20-35" stroke={F.white} strokeWidth="4" strokeLinecap="round" fill="none" />
          <circle cx="60" cy="23" r="5" fill={F.mint} {...line(L.mint, 2)} />
          <path d="M12 86h96" {...line(L.mint)} />
        </g>
      )}
    </Sheet>
  );
}

/** Three-tier cake; each of the 14 strawberries is one slide deck. */
export function TieredCake({ ready, className = '' }: { ready: boolean[]; className?: string }) {
  const tiers = [
    { y: 128, x: 22, w: 196, h: 42, berries: 6, fill: F.creamSoft, drip: F.blush },
    { y: 88, x: 48, w: 144, h: 40, berries: 5, fill: F.blushSoft, drip: F.white },
    { y: 50, x: 78, w: 84, h: 38, berries: 3, fill: F.creamSoft, drip: F.blush },
  ];
  let k = 0;
  return (
    <Sheet viewBox="0 0 240 190" className={className}>
      <ellipse cx="120" cy="178" rx="110" ry="8" fill={F.blushSoft} />
      <path d="M10 170h220c0 5-3 8-8 8H18c-5 0-8-3-8-8z" fill={F.white} {...line(L.soft)} />
      {tiers.map((t, ti) => {
        const step = t.w / 8;
        const drip = `M${t.x} ${t.y + 6}` +
          Array.from({ length: 8 }, (_, i) => {
            const x = t.x + step * (i + 1);
            return `Q${x - step / 2} ${t.y + (i % 2 ? 22 : 16)} ${x} ${t.y + 6}`;
          }).join('') + `V${t.y}H${t.x}z`;
        const spots = Array.from({ length: t.berries }, (_, i) => t.x + ((i + 0.5) * t.w) / t.berries);
        return (
          <g key={ti}>
            <rect x={t.x} y={t.y} width={t.w} height={t.h} rx="9" fill={t.fill} {...line(L.soft)} />
            <path d={drip} fill={t.drip} {...line(L.soft, 2)} />
            {Array.from({ length: Math.floor(t.w / 18) }, (_, i) => (
              <circle key={i} cx={t.x + 10 + i * 18} cy={t.y + t.h - 9} r="1.8" fill={i % 2 ? F.berry : F.mint} />
            ))}
            {spots.map((cx) => {
              const on = ready[k++] ?? false;
              return on ? (
                <Berry key={cx} x={cx} y={t.y - 6} s={0.62} />
              ) : (
                <circle key={cx} cx={cx} cy={t.y - 5} r="6.5" fill={F.white} {...line(L.pink, 1.8)} strokeDasharray="3 3" />
              );
            })}
          </g>
        );
      })}
      <Spark x={30} y={60} r={6} />
      <Spark x={206} y={40} r={7} color={F.apricot} />
      <Spark x={214} y={98} r={4} />
    </Sheet>
  );
}

/** Teapot pouring into a cup: the "generating" state. */
export function TeaPour({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 170" className={className} aria-hidden="true" focusable="false">
      <ellipse cx="150" cy="158" rx="46" ry="6" fill={F.blushSoft} />
      <g>
        <path d="M116 108h68v14a30 30 0 0 1-30 30h-8a30 30 0 0 1-30-30z" fill={F.white} {...line(L.pink)} />
        <clipPath id="cup-clip">
          <path d="M118 110h64v12a28 28 0 0 1-28 28h-8a28 28 0 0 1-28-28z" />
        </clipPath>
        <g clipPath="url(#cup-clip)">
          <rect x="112" y="108" width="76" height="46" fill={F.apricot} className="animate-fill origin-bottom [transform-box:fill-box]" />
        </g>
        <path d="M184 116h6a10 10 0 0 1 0 20h-8" fill="none" {...line(L.pink)} />
        <Berry x={150} y={134} s={0.5} leaves={false} />
        <path d="M140 98c-3-6 3-9 0-15M156 98c-3-6 3-9 0-15" fill="none" stroke={F.mint} strokeWidth="3" strokeLinecap="round" className="animate-steam" />
      </g>
      <path d="M118 84c-2 10-2 18 0 24" stroke={F.apricot} strokeWidth="5" strokeLinecap="round" fill="none" opacity=".9" />
      <g className="animate-pour origin-[70px_90px]">
        <path d="M30 70c0-20 18-32 40-32s40 12 40 32v12c0 14-14 22-40 22S30 96 30 82z" fill={F.blush} {...line(L.pink)} />
        <path d="M108 70c8-4 12-10 14-14" fill="none" {...line(L.pink, 6)} />
        <path d="M108 70c8-4 12-10 14-14" fill="none" stroke={F.blush} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M30 66c-14-2-18 18-2 22" fill="none" {...line(L.pink, 4)} />
        <path d="M44 38c4-8 48-8 52 0" fill={F.creamSoft} {...line(L.pink)} />
        <circle cx="70" cy="28" r="6" fill={F.mint} {...line(L.mint, 2)} />
        <ellipse cx="46" cy="60" rx="4" ry="7" fill={F.white} opacity=".7" transform="rotate(25 46 60)" />
        <Berry x={70} y={76} s={0.6} />
      </g>
      <Spark x={30} y={26} r={6} />
      <Spark x={198} y={70} r={5} color={F.apricot} />
    </svg>
  );
}

export type MacaronState = 'empty' | 'answered' | 'missing' | 'correct' | 'wrong';

/** Progress dot shaped like a macaron. The current question is marked by its button. */
export function MiniMacaron({ state }: { state: MacaronState }) {
  const fill = { empty: F.white, answered: F.blush, missing: F.apricot, correct: F.mint, wrong: F.white }[state];
  const edge = { empty: L.soft, answered: L.pink, missing: L.crust, correct: L.mint, wrong: L.soft }[state];
  const dashed = state === 'empty' || state === 'wrong';
  return (
    <svg viewBox="0 0 40 32" className="h-full w-full" aria-hidden="true" focusable="false">
      <g {...line(edge, 1.8)} strokeDasharray={dashed ? '3 2.5' : undefined}>
        <path d="M5 19c0-3 7-5 15-5s15 2 15 5v3c0 2-7 4-15 4s-15-2-15-4z" fill={fill} />
        <path d="M4 16.5c0-1.5 7-3 16-3s16 1.5 16 3-7 3-16 3-16-1.5-16-3z" fill={F.creamSoft} />
        <path d="M5 15c0-6 7-10 15-10s15 4 15 10c0 1-7 2-15 2S5 16 5 15z" fill={fill} />
      </g>
      {state !== 'empty' && state !== 'wrong' && <ellipse cx="14" cy="9" rx="3" ry="1.3" fill={F.white} opacity=".8" />}
      {state === 'wrong' && <path d="M15 7l10 10M25 7 15 17" stroke={L.berry} strokeWidth="2.4" strokeLinecap="round" />}
      {state === 'correct' && <path d="m14 12 4 4 8-8" stroke={F.white} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

/** Top view of a round cake cut into one slice per question. */
export function ScoreCake({ results, className = '' }: { results: boolean[]; className?: string }) {
  const n = Math.max(results.length, 1);
  const r = 78;
  const cx = 100;
  const cy = 100;
  const point = (a: number, rad = r) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  return (
    <Sheet viewBox="0 0 200 200" className={className}>
      <circle cx={cx} cy={cy + 4} r={r + 15} fill={F.blushSoft} />
      <circle cx={cx} cy={cy} r={r + 12} fill={F.white} {...line(L.soft)} />
      {results.map((ok, i) => {
        const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        const a1 = -Math.PI / 2 + ((i + 1) * 2 * Math.PI) / n;
        const [x0, y0] = point(a0);
        const [x1, y1] = point(a1);
        const large = a1 - a0 > Math.PI ? 1 : 0;
        const [bx, by] = n === 1 ? [cx, cy] : point((a0 + a1) / 2, r * 0.6);
        const fill = ok ? (i % 2 ? F.blushSoft : F.creamSoft) : F.white;
        return (
          <g key={i}>
            {n === 1 ? (
              <circle cx={cx} cy={cy} r={r} fill={fill} {...line(ok ? L.pink : L.soft)} strokeDasharray={ok ? undefined : '5 4'} />
            ) : (
              <path d={`M${cx} ${cy}L${x0} ${y0}A${r} ${r} 0 ${large} 1 ${x1} ${y1}z`} fill={fill} {...line(ok ? L.pink : L.soft)} strokeDasharray={ok ? undefined : '5 4'} />
            )}
            {ok ? (
              <Berry x={bx} y={by} s={0.7} />
            ) : (
              <g transform={`translate(${bx} ${by})`} fill={F.apricot}>
                <circle cx="-4" cy="0" r="1.8" />
                <circle cx="3" cy="-3" r="1.4" />
                <circle cx="2" cy="4" r="1.6" />
              </g>
            )}
          </g>
        );
      })}
      <Spark x={22} y={24} r={7} />
      <Spark x={182} y={176} r={6} color={F.apricot} />
    </Sheet>
  );
}

/** Small teacup used as the logo mark. */
export function TeacupMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" className={className} aria-hidden="true" focusable="false">
      <path d="M6 14h22v6a10 10 0 0 1-10 10h-2A10 10 0 0 1 6 20z" fill={F.blush} {...line(L.pink, 2)} />
      <path d="M28 16h3a4 4 0 0 1 0 8h-4" fill="none" {...line(L.pink, 2)} />
      <path d="M3 32h30" {...line(L.pink, 2)} />
      <path d="M13 3c-2 3 2 4 0 8M20 3c-2 3 2 4 0 8" stroke={F.mint} strokeWidth="2" fill="none" strokeLinecap="round" />
      <Berry x={17} y={21} s={0.32} leaves={false} />
    </svg>
  );
}

/** Mixing bowl and whisk: the admin "kitchen" mark. */
export function WhiskMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 36" className={className} aria-hidden="true" focusable="false">
      <path d="M24 4 15 18" {...line(L.crust, 2.2)} />
      <path d="M16 18c-2-6 2-12 8-12s6 6 2 12" fill="none" {...line(L.mint, 2)} />
      <path d="M4 18h32c0 8-7 14-16 14S4 26 4 18z" fill={F.apricot} {...line(L.crust, 2)} />
      <path d="M10 22c3 2 6 3 10 3" stroke={F.white} strokeWidth="2" fill="none" strokeLinecap="round" opacity=".8" />
    </svg>
  );
}

/** Scattered sparkles and tiny berries behind the page, like a sticker sheet. */
export function Backdrop() {
  return (
    <svg aria-hidden="true" focusable="false" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 1440 900">
      <g opacity=".55">
        <Spark x={70} y={180} r={9} />
        <Spark x={1380} y={140} r={11} color={F.apricot} />
        <Spark x={1330} y={620} r={8} />
        <Spark x={110} y={720} r={10} color={F.apricot} />
        <Spark x={720} y={860} r={7} />
        <Berry x={40} y={420} s={1.1} />
        <Berry x={1405} y={380} s={1.2} />
        <Berry x={1390} y={840} s={0.9} />
      </g>
    </svg>
  );
}
