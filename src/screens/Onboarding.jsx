import { useEffect, useRef, useState } from "react";
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
function PickCategories({ selected, onChange, onBack, onDone }) {
  const title = useRef(null);
  useEffect(() => { title.current?.focus(); }, []);
  return (
    <div className="screen picker">
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
        <CategoryCloud selected={selected} onChange={onChange} labelledBy="pick-title" />
      </div>
      <div className="screen__actions">
        <Button disabled={selected.length === 0} onClick={onDone}>Continue</Button>
      </div>
    </div>
  );
}
