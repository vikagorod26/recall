import { Icon } from "./Icon.jsx";
import { Beam } from "./Beam.jsx";
import { shortDate } from "../lib/content.js";

// "Tip of the day": always its own block under the deck, never inside a card.
export function DailyTip({ tip }) {
  if (!tip) return null;
  return (
    <aside className="daily" aria-label="Tip of the day">
      <Beam />
      <div className="daily__head">
        <span className="daily__label label">
          <Icon id="sparkles" className="icon--sm" />
          Tip of the day
        </span>
        <span className="daily__until">Until {shortDate(tip.expires)}</span>
      </div>
      <p className="daily__text">{tip.title}</p>
      <p className="daily__meta">{tip.text}</p>
    </aside>
  );
}
