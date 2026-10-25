import { useId } from "react";

// Abstract intro graphics, drawn in SVG with token colors only.
// Slow loops come from the .art-* classes in components.css and stop under
// "reduce motion". Gradient/filter ids are made unique per instance (useId).

const c = name => ({ stopColor: `var(${name})` });
const fill = name => ({ fill: `var(${name})` });
const stroke = name => ({ stroke: `var(${name})` });

export function IntroArt({ variant, className = "" }) {
  const Art = { night: Night, rings: Rings, cards: Cards }[variant];
  return (
    <svg className={`intro-art ${className}`} viewBox="0 0 320 320" role="img" aria-hidden="true">
      <Art id={useId().replace(/:/g, "")} />
    </svg>
  );
}

// 1 · "One more game?" — late night: crescent moon, twinkling stars, a glowing 03:00.
function Night({ id }) {
  const stars = [
    [42, 58, 1.6, "--color-text", 0], [86, 34, 1.2, "--color-text", 1.1], [130, 72, 1.8, "--cat-sleep", 0.4],
    [262, 168, 1.4, "--color-text", 2], [282, 62, 1.2, "--cat-music", 1.6], [58, 140, 1.4, "--color-text", 2.4],
    [24, 210, 1.2, "--color-text", 0.8], [292, 228, 1.6, "--color-brand-accent", 1.3], [170, 30, 1.2, "--color-text", 2.8],
  ];
  return (
    <>
      <defs>
        <radialGradient id={`${id}sky`} cx="50%" cy="50%" r="50%">
          <stop offset="0" style={{ ...c("--color-brand"), stopOpacity: 0.5 }} />
          <stop offset="1" style={{ ...c("--color-brand"), stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id={`${id}moon`} cx="35%" cy="35%" r="75%">
          <stop offset="0" style={c("--color-text")} />
          <stop offset="1" style={c("--color-brand-accent")} />
        </radialGradient>
        <linearGradient id={`${id}clock`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={c("--color-text")} />
          <stop offset="1" style={c("--color-brand-accent")} />
        </linearGradient>
        <mask id={`${id}crescent`}>
          <rect width="320" height="320" fill="white" />
          <circle cx="232" cy="88" r="40" fill="black" />
        </mask>
        <filter id={`${id}blur`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
      </defs>

      <circle cx="160" cy="160" r="160" fill={`url(#${id}sky)`} />

      {stars.map(([x, y, r, col, delay]) => (
        <circle key={`${x}-${y}`} className="art-twinkle" cx={x} cy={y} r={r} style={{ ...fill(col), animationDelay: `${delay}s` }} />
      ))}

      <g className="art-float">
        <circle cx="210" cy="104" r="46" style={fill("--color-brand-accent")} opacity="0.45" filter={`url(#${id}blur)`} />
        <circle cx="210" cy="104" r="46" fill={`url(#${id}moon)`} mask={`url(#${id}crescent)`} />
      </g>

      <g className="art-float" style={{ animationDelay: "-3s" }}>
        <rect x="58" y="188" width="204" height="104" rx="20" style={fill("--color-brand")} opacity="0.35" filter={`url(#${id}blur)`} />
        <rect x="58" y="188" width="204" height="104" rx="20" style={{ ...fill("--color-surface"), ...stroke("--color-border-strong") }} strokeWidth="1" />
        <rect x="88" y="188" width="144" height="1" style={fill("--color-brand-accent")} opacity="0.7" />
        <text x="160" y="257" textAnchor="middle" fill={`url(#${id}clock)`}
          style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "52px", letterSpacing: "-0.02em" }}>
          03:00
        </text>
      </g>
    </>
  );
}

// 2 · "Hit recall instead." — a reset: glowing core, concentric rings pulsing out.
function Rings({ id }) {
  const rings = [[44, 0.9], [74, 0.55], [104, 0.32], [134, 0.16]];
  const sparks = [[74, 30, "--cat-sports"], [104, 160, "--cat-outdoors"], [134, 250, "--cat-music"], [104, 320, "--cat-friends"]];
  return (
    <>
      <defs>
        <radialGradient id={`${id}core`} cx="50%" cy="50%" r="50%">
          <stop offset="0" style={c("--color-text")} />
          <stop offset="0.35" style={c("--color-brand-accent")} />
          <stop offset="1" style={{ ...c("--color-brand"), stopOpacity: 0 }} />
        </radialGradient>
        <radialGradient id={`${id}halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0" style={{ ...c("--color-brand"), stopOpacity: 0.55 }} />
          <stop offset="1" style={{ ...c("--color-brand"), stopOpacity: 0 }} />
        </radialGradient>
      </defs>

      <circle cx="160" cy="160" r="160" fill={`url(#${id}halo)`} />

      {[0, 2, 4].map(delay => (
        <circle key={delay} className="art-pulse" cx="160" cy="160" r="44" fill="none" strokeWidth="1.5"
          style={{ ...stroke("--color-brand-accent"), animationDelay: `${-delay}s` }} />
      ))}

      {rings.map(([r, o]) => (
        <circle key={r} cx="160" cy="160" r={r} fill="none" strokeWidth="1.5" opacity={o} style={stroke("--color-brand")} />
      ))}

      <g className="art-spin">
        <circle cx="160" cy="160" r="119" fill="none" strokeWidth="1" strokeDasharray="2 10" opacity="0.6" style={stroke("--color-brand-accent")} />
        {sparks.map(([r, deg, col]) => {
          const a = (deg * Math.PI) / 180;
          return <circle key={deg} cx={160 + r * Math.cos(a)} cy={160 + r * Math.sin(a)} r="4" style={fill(col)} />;
        })}
      </g>

      <circle cx="160" cy="160" r="36" fill={`url(#${id}core)`} />
      <circle cx="160" cy="160" r="10" style={fill("--color-text")} />
    </>
  );
}

// 3 · "Zero LP lost." — floating stack of tip cards in category colors.
function Cards({ id }) {
  const cards = [
    { cat: "--cat-sleep", x: 70, y: 70, rot: -12, delay: "-1s", dur: "7s" },
    { cat: "--cat-cooking", x: 118, y: 58, rot: 9, delay: "-4s", dur: "6.5s" },
    { cat: "--cat-outdoors", x: 92, y: 96, rot: -2, delay: "0s", dur: "6s" },
  ];
  return (
    <>
      <defs>
        <radialGradient id={`${id}halo`} cx="50%" cy="55%" r="50%">
          <stop offset="0" style={{ ...c("--color-brand"), stopOpacity: 0.5 }} />
          <stop offset="1" style={{ ...c("--color-brand"), stopOpacity: 0 }} />
        </radialGradient>
        <filter id={`${id}blur`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter>
      </defs>

      <circle cx="160" cy="176" r="150" fill={`url(#${id}halo)`} />

      {cards.map(({ cat, x, y, rot, delay, dur }) => (
        <g key={cat} className="art-float" style={{ animationDelay: delay, animationDuration: dur }}>
          <g transform={`rotate(${rot} ${x + 70} ${y + 90})`}>
            <rect x={x} y={y} width="140" height="180" rx="20" style={fill(cat)} opacity="0.28" filter={`url(#${id}blur)`} />
            <rect x={x} y={y} width="140" height="180" rx="20" strokeWidth="1"
              style={{ ...fill("--color-surface"), ...stroke(cat), strokeOpacity: 0.5 }} />
            <rect x={x + 30} y={y} width="80" height="1.5" style={fill(cat)} opacity="0.9" />
            <rect x={x + 16} y={y + 18} width="48" height="14" rx="7" style={fill(cat)} />
            <rect x={x + 16} y={y + 48} width="100" height="11" rx="5.5" style={fill("--color-text")} opacity="0.9" />
            <rect x={x + 16} y={y + 66} width="70" height="11" rx="5.5" style={fill("--color-text")} opacity="0.9" />
            <rect x={x + 16} y={y + 90} width="104" height="6" rx="3" style={fill("--color-text-muted")} opacity="0.55" />
            <rect x={x + 16} y={y + 102} width="80" height="6" rx="3" style={fill("--color-text-muted")} opacity="0.55" />
            <circle cx={x + 118} cy={y + 158} r="8" fill="none" strokeWidth="2" style={stroke(cat)} />
          </g>
        </g>
      ))}
    </>
  );
}
