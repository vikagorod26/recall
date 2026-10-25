import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { readMotionTokens } from "../lib/motionTokens.js";
import { Button, IconButton } from "../components/Buttons.jsx";
import { CategoryCloud } from "../components/CategoryCloud.jsx";
import { IntroCarousel } from "../components/IntroCarousel.jsx";

export const INTRO_SLIDES = [
  { art: "night", title: "One more game?", text: "It has never once meant one game. We've all seen 3am from the client." },
  { art: "rings", title: "Hit recall instead.", text: "Swipe for something to do. Each one takes about a game's worth of time." },
  { art: "cards", title: "Zero LP lost.", text: "Not quitting League. Just not autopiloting into game six." },
];

// First launch only: three intro screens, then pick categories.
export function Onboarding({ onDone }) {
  const [step, setStep] = useState("intro");
  const [introAt, setIntroAt] = useState(0);
  const [selected, setSelected] = useState([]);

  if (step === "intro") {
    return (
      <IntroCarousel
        slides={INTRO_SLIDES}
        startAt={introAt}
        onDone={() => setStep("pick")}
        onSkip={() => setStep("pick")}
      />
    );
  }

  return (
    <PickCategories
      selected={selected}
      onChange={setSelected}
      onBack={() => { setIntroAt(INTRO_SLIDES.length - 1); setStep("intro"); }}
      onDone={() => onDone(selected)}
    />
  );
}

// Category picker: headline, chips falling into a loose cloud, Continue.
// Continue plays the "gather" exit (selected chips fly into where the deck
// will be and dissolve, everything else fades), then hands over to the main screen.
function PickCategories({ selected, onChange, onBack, onDone }) {
  const title = useRef(null);
  const reduce = !!useReducedMotion();
  const [gatherTo, setGatherTo] = useState(null);
  useEffect(() => { title.current?.focus(); }, []);

  const finish = () => {
    if (gatherTo) return;
    const g = readMotionTokens().gather;
    // where the deck's center will be on the main screen
    setGatherTo({ x: window.innerWidth / 2, y: window.innerHeight * g.targetY });
    const ms = reduce ? g.fade * 1000 : (g.duration + Math.max(0, selected.length - 1) * g.stagger) * 1000;
    setTimeout(onDone, ms);
  };

  return (
    <div className={`screen picker${gatherTo ? " is-leaving" : ""}`}>
      <div className="top-bar">
        <IconButton icon="chevron-left" label="Back to the intro" onClick={onBack} />
      </div>
      <div className="picker__head">
        <h1 className="screen__title" id="pick-title" ref={title} tabIndex={-1}>
          What do you do when you're not in queue?
        </h1>
        <p className="screen__lead">Pick your side quests. As many as you like, swap them anytime.</p>
      </div>
      <div className="picker__cloud">
        <CategoryCloud selected={selected} onChange={onChange} labelledBy="pick-title" gatherTo={gatherTo} />
      </div>
      <div className="screen__actions">
        <Button disabled={selected.length === 0 || !!gatherTo} onClick={finish}>Continue</Button>
      </div>
    </div>
  );
}
