// Reads the swipe/deck motion values from tokens.css so framer-motion gets
// numbers while tokens.css stays the single source. Read on demand: values
// change when the "reduce motion" setting changes.

const css = () => getComputedStyle(document.documentElement);
const num = (s, name) => {
  const n = parseFloat(css().getPropertyValue(name));
  return Number.isFinite(n) ? n : s;
};
// Durations come back in seconds (framer wants seconds). The production CSS
// minifier rewrites "2000ms" as "2s", so read the unit instead of assuming ms.
const ms = (fallback, name) => {
  const raw = css().getPropertyValue(name).trim();
  const n = parseFloat(raw);
  if (!Number.isFinite(n)) return fallback / 1000;
  return /\dms$/.test(raw) ? n / 1000 : /\ds$/.test(raw) ? n : n / 1000;
};
const bezier = (fallback, name) => {
  const m = css().getPropertyValue(name).match(/cubic-bezier\(([^)]+)\)/);
  return m ? m[1].split(",").map(Number) : fallback;
};

const spring = (prefix, stiffness, damping) => ({
  type: "spring",
  stiffness: num(stiffness, `${prefix}-stiffness`),
  damping: num(damping, `${prefix}-damping`),
});

export function readMotionTokens() {
  return {
    threshold: num(0.28, "--swipe-threshold"),
    flickVelocity: num(500, "--swipe-flick-velocity"),
    flickMin: num(30, "--swipe-flick-min"),
    rotateMax: num(10, "--swipe-rotate-max"),
    flyDistance: num(1.4, "--swipe-fly-distance"),
    restSolid: num(0.92, "--swipe-card-rest-solid"),
    swipeOut: ms(320, "--duration-swipe-out"),
    settle: ms(260, "--duration-swipe-settle"),
    deckShift: ms(300, "--duration-deck-shift"),
    introSlide: ms(420, "--duration-intro-slide"),
    beamLoop: ms(6000, "--duration-beam-loop"),
    splashFirst: ms(2000, "--duration-splash-first"),
    splashReturn: ms(1000, "--duration-splash-return"),
    splashOut: ms(450, "--duration-splash-out"),
    gather: {
      duration: ms(380, "--duration-gather"),
      fade: ms(220, "--duration-gather-fade"),
      stagger: ms(25, "--gather-stagger"),
      scale: num(0.45, "--gather-scale"),
      fadeScale: num(0.92, "--gather-fade-scale"),
      targetY: num(0.52, "--gather-target-y"),
      ease: bezier([0.6, 0, 0.4, 1], "--ease-gather"),
      riseDistance: num(56, "--rise-distance"),
      rise: spring("--spring-rise", 380, 28),
      riseStagger: ms(80, "--rise-stagger"),
      riseSettle: ms(500, "--duration-rise-settle"),
    },
    sheet: {
      spring: spring("--spring-sheet", 360, 36),
      closeThreshold: num(0.25, "--sheet-close-threshold"),
      closeVelocity: num(600, "--sheet-close-velocity"),
      fade: ms(220, "--duration-sheet-fade"),
      openDelay: ms(400, "--sheet-open-delay"),
      reactionIn: ms(400, "--duration-reaction-in"),
    },
    chip: {
      checkSlot: num(30, "--chip-check-slot"),
      tiltMax: num(5, "--chip-tilt-max"),
      tiltShare: num(0.45, "--chip-tilt-share"),
      tiltMin: num(0.4, "--chip-tilt-min"),
      dropDistance: num(120, "--chip-drop-distance"),
      dropFade: ms(220, "--chip-drop-fade"),
      dropStagger: ms(32, "--chip-drop-stagger"),
      drop: spring("--spring-drop", 340, 28),
      select: spring("--spring-select", 620, 22),
      morph: spring("--spring-morph", 420, 34),
      selectScale: num(1.04, "--chip-select-scale"),
      pressScale: num(0.95, "--chip-press-scale"),
      fade: ms(300, "--duration-chip-fade"),
      haptic: num(8, "--haptic-chip"),
    },
    easeOut: bezier([0.22, 1, 0.36, 1], "--ease-out"),
    easeIn: bezier([0.55, 0, 1, 0.45], "--ease-in"),
    haptic: num(12, "--haptic-swipe"),
    poses: [
      { x: 0, y: 0, rotate: 0, scale: 1 },
      { x: num(8, "--deck-1-x"), y: num(12, "--deck-1-y"), rotate: num(2.5, "--deck-1-rotate"), scale: num(0.97, "--deck-1-scale") },
      { x: num(-6, "--deck-2-x"), y: num(22, "--deck-2-y"), rotate: num(-3.5, "--deck-2-rotate"), scale: num(0.94, "--deck-2-scale") },
    ],
  };
}
