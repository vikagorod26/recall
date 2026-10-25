import { Icon } from "./Icon.jsx";
import { categoryById } from "../lib/content.js";

export function CategoryTag({ categoryId }) {
  const c = categoryById[categoryId];
  return (
    <span className="tag" data-category={categoryId}>
      <Icon id={c.icon} />
      {c.label}
    </span>
  );
}

// Glassy text tip card. `back` = waiting in the deck: only its edge shows.
export function TipCard({ tip, compact = false, back = false }) {
  const c = categoryById[tip.category];
  const cls = ["tip-card", compact && "tip-card--compact", back && "tip-card--back"].filter(Boolean).join(" ");
  return (
    <article className={cls} data-category={tip.category} aria-hidden={back || undefined}>
      <div className="tip-card__head">
        <CategoryTag categoryId={tip.category} />
        <span className="tip-card__time">
          <Icon id="timer" className="icon--sm" />
          {tip.minutes} min
        </span>
      </div>
      <h2 className="tip-card__title">{tip.title}</h2>
      <p className="tip-card__body">{tip.text}</p>
      <div className="tip-card__foot">
        <Icon id={c.icon} className={`${compact ? "icon--lg" : "icon--xl"} tip-card__icon`} />
      </div>
    </article>
  );
}
