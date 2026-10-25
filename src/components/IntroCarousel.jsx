import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { IntroArt } from "./IntroArt.jsx";
import { ProgressButton } from "./ProgressButton.jsx";
import { readMotionTokens } from "../lib/motionTokens.js";

// Onboarding intro: swipeable screens (graphic, headline, subtext), a progress
// button that fills a third per screen and turns into a checkmark on the last,
// and "Skip" in the top corner.
// slides: [{ art: "night" | "rings" | "cards", title, text }]
export function IntroCarousel({ slides, startAt = 0, onDone, onSkip, framed = false }) {
  const [index, setIndex] = useState(startAt);
  const viewport = useRef(null);
  const x = useMotionValue(0);
  const last = slides.length - 1;

  const width = () => viewport.current?.offsetWidth || 1;
  const settle = i => {
    const t = readMotionTokens();
    animate(x, -i * width(), { duration: t.introSlide, ease: t.easeOut });
  };

  // first render jumps to `startAt` without animating; later changes slide
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) settle(index);
    else x.set(-index * width());
    mounted.current = true;
  }, [index]);

  // keep the current screen aligned when the window size changes
  useEffect(() => {
    const onResize = () => x.set(-index * width());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [index, x]);

  const go = i => {
    const next = Math.max(0, Math.min(last, i));
    if (next === index) settle(index);
    else setIndex(next);
  };

  const handleDragEnd = (_, info) => {
    const t = readMotionTokens();
    const dx = info.offset.x;
    const vx = info.velocity.x;
    const far = Math.abs(dx) > width() * t.threshold;
    const flick = Math.abs(vx) > t.flickVelocity && Math.abs(dx) > t.flickMin;
    go(far || flick ? index - Math.sign(dx) : index);
  };

  const done = index === last;

  return (
    <div className={`intro${framed ? " intro--framed" : ""}`}>
      <div className="intro__top">
        <button type="button" className="text-btn" onClick={onSkip}>Skip</button>
      </div>

      <div className="intro__viewport" ref={viewport} aria-roledescription="carousel" aria-label="Intro">
        <motion.div
          className="intro__track"
          style={{ x }}
          drag="x"
          dragConstraints={viewport}
          dragElastic={0.12}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          {slides.map((s, i) => (
            <section
              key={s.art}
              className="intro__slide"
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${slides.length}`}
              aria-hidden={i !== index || undefined}
              inert={i !== index}
            >
              <div className="intro__art"><IntroArt variant={s.art} /></div>
              <div className="intro__text" aria-live={i === index ? "polite" : undefined}>
                <h1 className="intro__title">{s.title}</h1>
                <p className="intro__sub">{s.text}</p>
              </div>
            </section>
          ))}
        </motion.div>
      </div>

      <div className="intro__bottom">
        <ProgressButton
          progress={(index + 1) / slides.length}
          done={done}
          label={done ? "Done. Pick your categories" : `Next (${index + 1} of ${slides.length})`}
          onClick={() => (done ? onDone() : go(index + 1))}
        />
      </div>
    </div>
  );
}
