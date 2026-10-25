import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useMotionValueEvent, useTransform } from "framer-motion";
import { TipCard } from "./TipCard.jsx";
import { readMotionTokens } from "../lib/motionTokens.js";
import { useInfiniteDeck } from "../lib/useInfiniteDeck.js";

// Swipeable tip deck. Adapted from a "tinder-like" card stack, with these
// differences: text tip cards, both directions mean "next tip", the drag glow
// uses the card's category color, cards are keyed by stable tip ids (not array
// index), the deck never runs out, and every number comes from tokens.css.

function useMotionTokens() {
  const [tokens, setTokens] = useState(readMotionTokens);
  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setTokens(readMotionTokens());
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return tokens;
}

function vibrate(ms) {
  try { navigator.vibrate?.(ms); } catch { /* unsupported: no haptics */ }
}

export function SwipeDeck({ tips, persistKey, lockScroll = false, onSwipe }) {
  const tokens = useMotionTokens();
  const { visible, advance } = useInfiniteDeck(tips, { persistKey });
  const exitDirs = useRef({});            // tip id -> -1 (left) | 1 (right)
  const refocus = useRef(false);          // keyboard swipe: focus the next top card
  const reveal = useMotionValue(0);       // 0..1 drag progress of the top card: fades in the next card's content

  const swipe = useCallback((id, dir, { viaKeyboard = false } = {}) => {
    exitDirs.current[id] = dir;
    refocus.current = viaKeyboard;
    reveal.set(0);
    vibrate(tokens.haptic);
    advance();
    onSwipe?.(id, dir);
  }, [advance, onSwipe, reveal, tokens.haptic]);

  return (
    <div
      className={`swipe-deck${lockScroll ? " swipe-deck--locked" : ""}`}
      aria-label="Tips. Swipe the top card, or press the left or right arrow key, for another tip."
    >
      <AnimatePresence initial={false}>
        {visible.map((tip, depth) => (
          <DeckSlot
            key={tip.id}
            tip={tip}
            depth={depth}
            tokens={tokens}
            exitDirs={exitDirs}
            refocus={refocus}
            reveal={reveal}
            onSwipe={swipe}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function DeckSlot({ tip, depth, tokens, exitDirs, refocus, reveal, onSwipe }) {
  // a card that is flying out is no longer the top card, even for a moment
  const isPresent = useIsPresent();
  const isTop = depth === 0 && isPresent;
  const cardRef = useRef(null);

  useEffect(() => {
    if (isTop && refocus.current) {
      refocus.current = false;
      cardRef.current?.focus();
    }
  }, [isTop, refocus]);
  const width = useRef(340);
  const x = useMotionValue(0);
  const rotate = useTransform(x, v => (v / width.current) * tokens.rotateMax);
  const glow = useTransform(x, v => Math.min(1, Math.abs(v) / (width.current * tokens.threshold)));
  useMotionValueEvent(glow, "change", v => { if (isTop) reveal.set(v); });

  const pose = tokens.poses[Math.min(depth, 2)];
  const shift = { duration: tokens.deckShift, ease: tokens.easeOut };

  const measure = () => { if (cardRef.current) width.current = cardRef.current.offsetWidth || width.current; };

  const handleDragEnd = (_, info) => {
    measure();
    const dx = info.offset.x;
    const vx = info.velocity.x;
    const far = Math.abs(dx) > width.current * tokens.threshold;
    const flick = Math.abs(vx) > tokens.flickVelocity && Math.abs(dx) > tokens.flickMin && Math.sign(vx) === Math.sign(dx);
    if (far || flick) onSwipe(tip.id, Math.sign(dx) || 1);
    else animate(x, 0, { duration: tokens.settle, ease: tokens.easeOut });
  };

  const handleKeyDown = e => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    measure();
    onSwipe(tip.id, e.key === "ArrowRight" ? 1 : -1, { viaKeyboard: true });
  };

  const exit = () => {
    const dir = exitDirs.current[tip.id] ?? 1;
    delete exitDirs.current[tip.id];
    return {
      x: dir * width.current * tokens.flyDistance,
      rotate: dir * tokens.rotateMax,
      opacity: 0,
      transition: { duration: tokens.swipeOut, ease: tokens.easeIn },
    };
  };

  return (
    <motion.div
      className="swipe-deck__slot"
      data-depth={depth}
      style={{ zIndex: 3 - depth, ...(depth === 1 && { "--reveal": reveal }) }}
      initial={{ ...tokens.poses[2], opacity: 0 }}
      animate={{ ...pose, opacity: 1, transition: shift }}
      exit="exit"
      variants={{ exit }}
    >
      <motion.div
        ref={cardRef}
        className="swipe-card"
        data-category={tip.category}
        data-top={isTop || undefined}
        tabIndex={isTop ? 0 : -1}
        aria-hidden={!isTop || undefined}
        drag={isTop ? "x" : false}
        dragMomentum={false}
        onDragStart={measure}
        onDragEnd={handleDragEnd}
        onKeyDown={isTop ? handleKeyDown : undefined}
        style={{ x, rotate }}
      >
        <TipCard tip={tip} back={depth > 0} />
        <motion.div className="swipe-card__glow" style={{ opacity: glow }} />
      </motion.div>
    </motion.div>
  );
}

// Static picture of the top card for the styleguide's state examples.
// `offset` is the drag distance as a share of card width (-1..1).
export function SwipeCardStill({ tip, offset = 0, flying = false }) {
  const t = readMotionTokens();
  const glow = Math.min(1, Math.abs(offset) / t.threshold);
  return (
    <div
      className="swipe-card"
      data-category={tip.category}
      style={{
        transform: `translateX(${offset * 100}%) rotate(${offset * t.rotateMax + (flying ? Math.sign(offset) * t.rotateMax : 0)}deg)`,
        opacity: flying ? 0.45 : 1,
      }}
    >
      <TipCard tip={tip} />
      <div className="swipe-card__glow" style={{ opacity: glow }} />
    </div>
  );
}
