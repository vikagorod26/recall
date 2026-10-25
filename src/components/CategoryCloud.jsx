import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { Icon } from "./Icon.jsx";
import { categories, categoryById } from "../lib/content.js";
import { readMotionTokens } from "../lib/motionTokens.js";

// Big pill chip clouds: the onboarding category picker (`CategoryCloud`,
// multi-select, category colors) and any other pick-from-a-cloud question
// (`ChipCloud`, e.g. the "why play?" reasons: single-select, brand purple).
// Chips are loosely packed, a few tilted.
// On open they fall in one after another and land with a small bounce.
// Selecting fills a chip with its category color and draws a checkmark in;
// the label slides over while the chip's edge and its neighbours spring to
// their new places. Every number comes from tokens.css.

const PADS = ["var(--space-4)", "var(--space-5)", "var(--space-6)"];

function vibrate(ms) {
  try { navigator.vibrate?.(ms); } catch { /* no haptics */ }
}

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const CATEGORY_OPTIONS = categories.map(c => ({ id: c.id, label: c.label, icon: c.icon, category: c.id }));

export function CategoryCloud(props) {
  return <ChipCloud options={CATEGORY_OPTIONS} {...props} />;
}

// options: [{ id, label, icon, category? }]. `multiple` = toggle chips;
// otherwise single-select (radio semantics). `tone="brand"` = brand purple.
// `gatherTo` ({x, y} in viewport px): leave the screen — selected chips fly
// there, shrink, glow and dissolve; the others fade out (see tokens: gather).
export function ChipCloud({ options, selected, onChange, multiple = true, tone, labelledBy, fall = true, gatherTo = null }) {
  const reduce = !!useReducedMotion();
  const [t] = useState(readMotionTokens);
  // Per open: random tilt for some chips, slightly different widths, random fall order.
  const [looks] = useState(() => {
    const order = shuffle(options.map((_, i) => i));
    return options.map((_, i) => {
      const tilted = Math.random() < t.chip.tiltShare;
      const angle = (t.chip.tiltMin + Math.random() * (1 - t.chip.tiltMin)) * t.chip.tiltMax * (Math.random() < 0.5 ? -1 : 1);
      return {
        tilt: tilted ? angle : 0,
        pad: PADS[Math.floor(Math.random() * PADS.length)],
        delay: order.indexOf(i) * t.chip.dropStagger,
        spin: (Math.random() * 2 - 1) * t.chip.tiltMax,
      };
    });
  });

  const toggle = id => {
    vibrate(t.chip.haptic);
    const on = selected.includes(id);
    if (!multiple) return onChange(on ? [] : [id]);
    onChange(options.map(o => o.id).filter(o => (o === id ? !on : selected.includes(o))));
  };

  return (
    <div className="cloud" role={multiple ? "group" : "radiogroup"} aria-labelledby={labelledBy}>
      {options.map((o, i) => (
        <CloudChip
          key={o.id}
          gatherTo={gatherTo}
          gatherIndex={selected.indexOf(o.id)}
          option={o}
          tone={tone}
          radio={!multiple}
          selected={selected.includes(o.id)}
          onToggle={() => toggle(o.id)}
          look={looks[i]}
          fall={fall}
          t={t}
          reduce={reduce}
        />
      ))}
    </div>
  );
}

// One chip. Also used on its own in the styleguide (`pressed` forces the pressed look).
export function CloudChip({ option, categoryId, tone, radio = false, selected, onToggle, look = { tilt: 0, pad: PADS[1], delay: 0, spin: 0 }, fall = false, pressed = false, t = readMotionTokens(), reduce = false, gatherTo = null, gatherIndex = -1 }) {
  const c = option ?? { id: categoryId, label: categoryById[categoryId].label, icon: categoryById[categoryId].icon, category: categoryId };
  const SLOT = t.chip.checkSlot;
  const button = useRef(null);
  const body = useRef(null);

  // leaving: measure once, then fly from here to the gather point
  const [gather, setGather] = useState(null);
  useLayoutEffect(() => {
    if (!gatherTo || !button.current) return;
    const r = button.current.getBoundingClientRect();
    setGather({ x: gatherTo.x - (r.left + r.width / 2), y: gatherTo.y - (r.top + r.height / 2) });
  }, [gatherTo]);
  const width = useRef(null);

  // `lag`: how far the visible edge trails the real width. It jumps by the
  // change, then springs back to 0, so the chip grows smoothly while the row
  // has already re-flowed once (neighbours glide via layout animation).
  const lag = useMotionValue(0);
  const grown = useMotionValue(selected ? 1 : 0);
  const edge = useTransform(lag, v => -v);
  const checkScale = useTransform(grown, v => Math.min(v, 1.1));
  const checkOpacity = useTransform(grown, v => Math.min(1, v * 1.4));
  const checkDraw = useTransform(grown, v => Math.min(1, Math.max(0.001, v)));

  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    const next = el.offsetWidth;
    const prev = width.current;
    width.current = next;
    if (prev === null || prev === next) return;
    if (reduce) { lag.jump(0); return; }
    const velocity = lag.getVelocity();
    lag.jump(lag.get() + prev - next);
    animate(lag, 0, { ...t.chip.morph, velocity });
  }, [selected, lag, reduce, t]);

  useLayoutEffect(() => {
    const slot = selected ? SLOT : 0;
    const update = () => grown.set(Math.max(0, (slot + lag.get()) / SLOT));
    update();
    return lag.on("change", update);
  }, [selected, lag, grown, SLOT]);

  // passive size changes (a late web font) only re-baseline the width
  useEffect(() => {
    const el = body.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => { width.current = el.offsetWidth; });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = pressed ? t.chip.pressScale : selected && !reduce ? t.chip.selectScale : 1;
  const drop = { ...t.chip.drop, delay: look.delay };
  const initial = !fall
    ? false
    : reduce
      ? { opacity: 0, y: 0, rotate: look.tilt, scale: 1 }
      : { opacity: 0, y: -t.chip.dropDistance, rotate: look.tilt + look.spin, scale: 1 };

  const g = t.gather;
  const leaving = !!gatherTo;
  let target = { opacity: 1, y: 0, rotate: look.tilt, scale };
  let transition = {
    y: reduce ? { duration: 0 } : drop,
    rotate: reduce ? { duration: 0 } : drop,
    opacity: reduce ? { duration: t.chip.fade, delay: look.delay } : { duration: t.chip.dropFade, ease: t.easeOut, delay: look.delay },
    scale: reduce ? { duration: 0 } : t.chip.select,
    layout: reduce ? { duration: 0 } : t.chip.morph,
  };
  if (leaving && (reduce || !selected || !gather)) {
    target = { ...target, opacity: 0, scale: reduce ? scale : scale * g.fadeScale };
    transition = { default: { duration: g.fade, ease: t.easeOut } };
  } else if (leaving) {
    const tween = { duration: g.duration, ease: g.ease, delay: Math.max(0, gatherIndex) * g.stagger };
    target = { x: gather.x, y: gather.y, rotate: 0, scale: g.scale, opacity: [1, 1, 0] };
    transition = { default: tween, opacity: { ...tween, times: [0, 0.55, 1] } };
  }

  return (
    <motion.button
      type="button"
      ref={button}
      className={`cat-chip${pressed ? " is-pressed" : ""}${leaving && selected && !reduce ? " is-gathering" : ""}`}
      disabled={leaving || undefined}
      data-category={tone ? undefined : c.category}
      data-tone={tone}
      role={radio ? "radio" : undefined}
      aria-checked={radio ? selected : undefined}
      aria-pressed={radio ? undefined : selected}
      onClick={onToggle}
      layout="position"
      initial={initial}
      animate={target}
      whileTap={reduce || leaving ? undefined : { scale: t.chip.pressScale }}
      transition={transition}
      style={{ "--chip-pad": look.pad }}
    >
      <span ref={body} className="cat-chip__body" data-selected={selected}>
        <motion.span className="cat-chip__surface" style={{ right: edge }} aria-hidden="true" />
        <motion.svg className="cat-chip__check" viewBox="0 0 24 24" aria-hidden="true"
          style={{ scale: checkScale, opacity: checkOpacity }}>
          <motion.path d="M4 12.5 9.5 18 20 6.5" style={{ pathLength: checkDraw }} />
        </motion.svg>
        <span className="cat-chip__slot" style={{ width: selected ? SLOT : 0 }} aria-hidden="true" />
        <motion.span className="cat-chip__content" style={{ x: lag }}>
          <Icon id={c.icon} />
          {c.label}
        </motion.span>
      </span>
    </motion.button>
  );
}
