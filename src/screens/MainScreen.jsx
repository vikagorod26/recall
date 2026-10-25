import { useMemo } from "react";
import { SwipeDeck } from "../components/SwipeDeck.jsx";
import { DailyTip } from "../components/DailyTip.jsx";
import { IconButton } from "../components/Buttons.jsx";
import { Icon } from "../components/Icon.jsx";
import { tipOfTheDay, tipsForCategories } from "../lib/content.js";

export function MainScreen({ categories, onOpenSettings }) {
  const key = categories.join(",");
  const pool = useMemo(() => tipsForCategories(categories), [key]);
  const daily = useMemo(() => tipOfTheDay(), []);

  return (
    <div className="app">
      <header className="top-bar">
        <p className="logo logo--sm">Recall<span className="logo__dot">.</span></p>
        <IconButton icon="settings" label="Settings" onClick={onOpenSettings} />
      </header>
      <main className="app__deck">
        <SwipeDeck tips={pool} persistKey="seen" lockScroll />
      </main>
      <p className="swipe-hint label app__hint">
        <Icon id="arrow-left" className="icon--sm" />
        Swipe for another tip
        <Icon id="arrow-right" className="icon--sm" />
      </p>
      <DailyTip tip={daily} />
    </div>
  );
}
