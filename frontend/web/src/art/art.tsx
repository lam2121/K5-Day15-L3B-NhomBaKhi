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

/** Sugar flower: five petals around a centre. */
export function SugarFlower({ x, y, s = 1, fill = F.blush, edge = L.pink, center = F.apricot, dashed = false }: { x: number; y: number; s?: number; fill?: string; edge?: string; center?: string; dashed?: boolean }) {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    return [Math.cos(a) * 4.2, Math.sin(a) * 4.2];
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} strokeDasharray={dashed ? '2 2' : undefined}>
      {petals.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="3.6" fill={fill} {...line(edge, 1.2)} />
      ))}
      <circle r="2.4" fill={dashed ? F.white : center} {...line(edge, 1)} />
    </g>
  );
}

/** Piped cream rosette. */
function Rosette({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-10 4c-2-6 2-10 6-9 0-5 7-7 9-2 5-1 8 4 5 8 2 3 0 6-3 6H-7c-3 0-4-1-3-3z" fill={F.white} {...line(L.soft, 1.8)} />
      <path d="M-5 0c3 2 7 2 10-1" fill="none" {...line(L.soft, 1.4)} />
    </g>
  );
}

/** Cherry with stem. */
function Cherry({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0-4c1-6 4-9 8-10" fill="none" {...line(L.mint, 1.8)} />
      <circle r="6" fill={F.berry} {...line(L.berry, 1.8)} />
      <ellipse cx="-2.2" cy="-2" rx="1.6" ry="2.4" fill={F.white} opacity=".75" transform="rotate(30 -2.2 -2)" />
    </g>
  );
}

/** Mint leaf. */
function Leaf({ x, y, s = 1, r = 0 }: { x: number; y: number; s?: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0c2-7 9-10 14-8-1 6-7 10-14 8z" fill={F.mint} {...line(L.mint, 1.5)} />
      <path d="M2-1c3-2 6-4 9-5" fill="none" stroke={F.mintSoft} strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

/** Small heart. */
export function Heart({ x, y, s = 1, fill = F.berry, edge = L.berry }: { x: number; y: number; s?: number; fill?: string; edge?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 6C-4 3-8 0-8-4c0-3 2-5 4.5-5C-2-9-.6-7.6 0-6.5.6-7.6 2-9 3.5-9 6-9 8-7 8-4c0 4-4 7-8 10z" fill={fill} {...line(edge, 1.6)} />
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
      <Leaf x={58} y={34} s={0.9} r={-30} />
      <Leaf x={62} y={34} s={0.9} r={-150} />
      <path d="M68 36 78 20" {...line(L.crust, 4)} />
      <path d="M68 36 78 20" stroke={F.apricot} strokeWidth="2" strokeLinecap="round" />
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
      <Heart x={60} y={57} s={0.75} />
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
      <SugarFlower x={60} y={30} s={1.1} />
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

function RollCake() {
  return (
    <g>
      <Plate rx={38} />
      <path d="M30 46h52v32H30z" fill={F.cream} {...line(L.crust)} />
      <path d="M30 46c-9 0-14 7-14 16s5 16 14 16" fill={F.apricot} {...line(L.crust)} />
      <ellipse cx="30" cy="62" rx="14" ry="16" fill={F.cream} {...line(L.crust)} />
      <path d="M30 62c0-4 6-4 6 0 0 6-10 7-11 0-1-8 13-10 15-1 2 10-14 14-18 4" fill="none" stroke={F.white} strokeWidth="4" strokeLinecap="round" />
      <path d="M30 62c0-4 6-4 6 0 0 6-10 7-11 0-1-8 13-10 15-1 2 10-14 14-18 4" fill="none" {...line(L.soft, 1.4)} />
      <circle cx="31" cy="62" r="3.2" fill={F.berry} {...line(L.berry, 1.2)} />
      <path d="M38 44c2-5 7-5 9-1 2-5 8-5 10 0 2-5 8-5 10 0 2-4 7-4 9 1" fill={F.white} {...line(L.soft, 2)} />
      <Rosette x={50} y={40} s={0.7} />
      <Rosette x={68} y={40} s={0.7} />
      <Leaf x={58} y={36} s={0.6} r={-40} />
      <Spark x={104} y={34} r={4} />
    </g>
  );
}

function Pudding() {
  return (
    <g>
      <Plate rx={36} />
      <path d="M40 40h40l10 40c0 3-2 5-5 5H35c-3 0-5-2-5-5z" fill={F.apricot} {...line(L.crust)} />
      <path d="M40 40h40l3 11c-3 5-6 0-9 4-3 5-7-1-10 3-4 4-7-2-10 2-3 3-6-2-9 0-3 1-5-2-6-5z" fill="#C98C66" {...line(L.crust)} />
      <path d="M46 58c-1 8-2 16-3 22" stroke={F.white} strokeWidth="3.5" strokeLinecap="round" opacity=".7" />
      <path d="M44 38c0-5 6-7 9-4 2-5 10-6 13-1 4-3 10-1 10 5z" fill={F.white} {...line(L.soft, 2)} />
      <Rosette x={60} y={32} s={0.75} />
      <Leaf x={62} y={26} s={0.6} r={-50} />
      <Spark x={98} y={44} r={4} />
      <Spark x={20} y={50} r={3} color={F.blush} />
    </g>
  );
}

function IceCream() {
  return (
    <g>
      <Plate rx={22} y={88} />
      <path d="M46 50h28L61 88c-.4 1.2-1.6 1.2-2 0z" fill={F.apricot} {...line(L.crust)} />
      <path d="M50 58l18 14M54 70l10 8M70 58 52 72M66 70l-10 8" {...line(L.crust, 1.4)} />
      <path d="M42 50c-4 0-5-5-2-7-2-6 3-11 9-9 1-6 9-9 14-5 5-3 12 0 12 6 6 0 8 6 5 10 2 3 0 6-3 5z" fill={F.blush} {...line(L.pink)} />
      <path d="M48 46c4 2 9 2 14 0" fill="none" {...line(L.pink, 1.6)} />
      <ellipse cx="52" cy="36" rx="4" ry="2" fill={F.white} opacity=".75" transform="rotate(-20 52 36)" />
      <Cherry x={60} y={26} s={0.9} />
      <path d="M76 34l12-14" {...line(L.mint, 3)} />
      <Spark x={92} y={44} r={4} />
      <Spark x={28} y={30} r={3} color={F.apricot} />
    </g>
  );
}

function Daifuku() {
  return (
    <g>
      <Plate rx={36} />
      <path d="M24 74c0-22 16-36 36-36s36 14 36 36c0 6-16 9-36 9s-36-3-36-9z" fill={F.white} {...line(L.soft)} />
      <path d="M60 46c10 0 18 8 18 18 0 6-8 10-18 10s-18-4-18-10c0-10 8-18 18-18z" fill={F.blushSoft} opacity=".9" />
      <SugarFlower x={60} y={60} s={1.5} fill={F.blush} />
      <path d="M38 54c2-6 6-10 12-12" stroke={F.blushSoft} strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="36" cy="70" r="3" fill={F.blush} opacity=".8" />
      <circle cx="84" cy="70" r="3" fill={F.blush} opacity=".8" />
      <Spark x={100} y={36} r={4} />
    </g>
  );
}

function Tart() {
  return (
    <g>
      <Plate rx={42} />
      <path d="M18 58h84l-6 22c-1 3-3 4-6 4H30c-3 0-5-1-6-4z" fill={F.apricot} {...line(L.crust)} />
      <path d="M26 60l3 20M38 60l2 22M50 60l1 22M62 60v22M74 60l-1 22M86 60l-2 22M98 60l-3 18" {...line(L.crust, 1.2)} opacity=".6" />
      <ellipse cx="60" cy="58" rx="42" ry="9" fill={F.creamSoft} {...line(L.crust)} />
      <path d="M32 54c0-7 6-11 12-11 0 6-5 11-12 11z" fill={F.apricot} {...line(L.crust, 1.6)} />
      <path d="M76 54c0-7 6-11 12-11 0 6-5 11-12 11z" fill={F.apricot} {...line(L.crust, 1.6)} />
      <circle cx="60" cy="52" r="7" fill={F.mint} {...line(L.mint, 1.6)} />
      <circle cx="60" cy="52" r="3.2" fill={F.mintSoft} />
      <circle cx="50" cy="58" r="3.2" fill={F.mint} {...line(L.mint, 1.2)} />
      <circle cx="70" cy="58" r="3.2" fill={F.blush} {...line(L.pink, 1.2)} />
      <Spark x={104} y={34} r={4} />
    </g>
  );
}

function Teacup() {
  return (
    <g>
      <ellipse cx="60" cy="84" rx="38" ry="7" fill={F.white} {...line(L.soft, 2)} />
      <path d="M30 48h52v12c0 14-11 24-26 24s-26-10-26-24z" fill={F.white} {...line(L.pink)} />
      <path d="M82 52h5c7 0 7 13 0 13h-6" fill="none" {...line(L.pink)} />
      <ellipse cx="56" cy="48" rx="26" ry="5" fill={F.apricot} {...line(L.pink, 2)} />
      <path d="M36 62c4 2 6-2 10 0s6-2 10 0 6-2 10 0 6-2 10 0" fill="none" {...line(L.mint, 1.6)} />
      <Heart x={56} y={73} s={0.6} />
      <path d="M48 38c-3-5 3-7 0-12M62 38c-3-5 3-7 0-12" fill="none" stroke={F.mint} strokeWidth="2.4" strokeLinecap="round" />
      <Spark x={96} y={34} r={4} />
      <Spark x={22} y={40} r={3} color={F.blush} />
    </g>
  );
}

function CookieStack() {
  return (
    <g>
      <Plate rx={34} />
      <ellipse cx="60" cy="74" rx="30" ry="9" fill={F.apricot} {...line(L.crust)} />
      <ellipse cx="60" cy="64" rx="28" ry="8" fill={F.blush} {...line(L.pink)} />
      <ellipse cx="60" cy="56" rx="30" ry="9" fill={F.apricot} {...line(L.crust)} />
      {[[46, 54], [58, 51], [70, 55], [52, 59], [66, 59]].map(([x, y]) => (
        <ellipse key={`${x}${y}`} cx={x} cy={y} rx="2.4" ry="1.6" fill="#A86A48" />
      ))}
      <path d="M38 50c4-3 8-4 12-4" stroke={F.white} strokeWidth="2.5" strokeLinecap="round" opacity=".7" />
      <Heart x={70} y={44} s={0.8} fill={F.blush} edge={L.pink} />
      <Spark x={100} y={36} r={4} />
      <Spark x={22} y={44} r={3} color={F.apricot} />
    </g>
  );
}

// Fourteen drawings, one per slide deck.
const SHAPES = [ShortcakeSlice, Macaron, Cupcake, BigBerry, Parfait, Donut, MilkCarton, RollCake, Pudding, IceCream, Daifuku, Tart, Teacup, CookieStack];

/** One pastry per slide deck, so each card on the menu looks different. */
export function Pastry({ index, covered = false, className = '' }: { index: number; covered?: boolean; className?: string }) {
  const Shape = SHAPES[index % SHAPES.length];
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 120 100" className={className} aria-hidden="true" focusable="false">
      <defs>
        <filter id={`w${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="1.8" />
        </filter>
        <filter id={`g${id}`}>
          <feColorMatrix type="saturate" values="0.15" />
        </filter>
      </defs>
      <g filter={`url(#w${id})`}>
        {covered ? (
          // Not ready yet: the same drawing, faded and desaturated, with a small lock sticker.
          <>
            <g filter={`url(#g${id})`} opacity="0.4">
              <Shape />
            </g>
            <g transform="translate(92 70)">
              <circle r="13" fill={F.white} {...line(L.soft, 2)} />
              <path d="M-4.5-2v-3a4.5 4.5 0 0 1 9 0v3" fill="none" {...line(L.crust, 2)} />
              <rect x="-6.5" y="-2" width="13" height="10" rx="2.5" fill={F.apricot} {...line(L.crust, 2)} />
              <circle cy="3" r="1.4" fill="#A86A48" />
            </g>
          </>
        ) : (
          <Shape />
        )}
      </g>
    </svg>
  );
}

/** Slender three-tier cake on a stand; each of the 14 sugar flowers is one slide deck. */
export function TieredCake({ ready, className = '' }: { ready: boolean[]; className?: string }) {
  const cx = 120;
  const tiers = [
    { y: 134, w: 128, h: 40, berries: 6, fill: F.creamSoft, cream: F.white },
    { y: 98, w: 94, h: 36, berries: 5, fill: F.blushSoft, cream: F.white },
    { y: 66, w: 60, h: 32, berries: 3, fill: F.creamSoft, cream: F.blushSoft },
  ];
  let k = 0;
  return (
    <Sheet viewBox="0 0 240 214" className={className}>
      {/* cake stand */}
      <ellipse cx={cx} cy="206" rx="40" ry="4" fill={F.blushSoft} />
      <path d={`M${cx - 26} 204c0-6 12-9 26-9s26 3 26 9z`} fill={F.white} {...line(L.soft, 1.8)} />
      <path d={`M${cx - 7} 196c2-6 2-12 0-18h14c-2 6-2 12 0 18z`} fill={F.white} {...line(L.soft, 1.8)} />
      <path d={`M${cx - 84} 176c0 4 38 7 84 7s84-3 84-7c0-2-38-3-84-3s-84 1-84 3z`} fill={F.white} {...line(L.soft, 1.8)} />
      {tiers.map((t, ti) => {
        const x = cx - t.w / 2;
        const n = Math.round(t.w / 16);
        const step = t.w / n;
        // A light frosting lip with short drips.
        const drip =
          `M${x} ${t.y + 3}` +
          Array.from({ length: n }, (_, i) => {
            const x1 = x + step * (i + 1);
            const depth = i % 3 === 1 ? 11 : 6;
            return `Q${x1 - step / 2} ${t.y + depth} ${x1} ${t.y + 3}`;
          }).join('') +
          `V${t.y}H${x}z`;
        const spots = Array.from({ length: t.berries }, (_, i) => x + 9 + (i * (t.w - 18)) / Math.max(t.berries - 1, 1));
        return (
          <g key={ti}>
            <rect x={x} y={t.y} width={t.w} height={t.h} rx="6" fill={t.fill} {...line(L.soft, 1.8)} />
            <path d={drip} fill={t.cream} {...line(L.soft, 1.5)} />
            {/* pearl piping along the base */}
            {Array.from({ length: Math.floor(t.w / 9) }, (_, i) => (
              <circle key={i} cx={x + 5 + i * 9} cy={t.y + t.h - 1} r="2.3" fill={F.white} {...line(L.soft, 1)} />
            ))}
            <path d={`M${x + 5} ${t.y + 14}v${t.h - 22}`} stroke={F.white} strokeWidth="2.5" strokeLinecap="round" opacity=".8" />
            {/* draped piping with one sugar flower per deck at each join */}
            <path
              d={`M${spots[0]} ${t.y + 14}` + spots.slice(1).map((sx, i) => `Q${(spots[i] + sx) / 2} ${t.y + 24} ${sx} ${t.y + 14}`).join('')}
              fill="none"
              stroke={F.white}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {spots.map((sx) => {
              const on = ready[k++] ?? false;
              const tone = k % 3;
              return on ? (
                <SugarFlower key={sx} x={sx} y={t.y + 14} s={0.62} fill={tone === 0 ? F.mint : tone === 1 ? F.blush : F.apricot} edge={tone === 0 ? L.mint : tone === 1 ? L.pink : L.crust} center={tone === 0 ? F.white : F.apricot} />
              ) : (
                <SugarFlower key={sx} x={sx} y={t.y + 14} s={0.62} fill={F.white} edge={L.pink} dashed />
              );
            })}
          </g>
        );
      })}
      <path d={`M${cx - 12} 66c0-6 5-9 9-7 1-6 9-7 11-1 5-2 9 2 8 8z`} fill={F.white} {...line(L.soft, 1.6)} />
      <circle cx={cx + 1} cy="57" r="3" fill={F.mint} {...line(L.mint, 1.2)} />
      <Spark x={44} y={70} r={6} />
      <Spark x={194} y={48} r={7} color={F.apricot} />
      <Spark x={204} y={120} r={4} />
      <Spark x={36} y={140} r={3.5} color={F.apricot} />
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
        <Heart x={150} y={134} s={0.7} />
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
        <circle cx="54" cy="78" r="3" fill={F.white} />
        <circle cx="70" cy="84" r="3" fill={F.white} />
        <circle cx="86" cy="78" r="3" fill={F.white} />
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
              <Rosette x={bx} y={by} s={0.75} />
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
      <Heart x={17} y={21} s={0.45} fill={F.white} edge={L.pink} />
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
        <Heart x={40} y={420} s={1.4} fill={F.blush} edge={L.pink} />
        <SugarFlower x={1405} y={380} s={1.6} />
        <Cherry x={1390} y={840} s={1.3} />
      </g>
    </svg>
  );
}
