import { Icon } from "./Icon.jsx";
import { categories } from "../lib/content.js";

// Multi-select of the 8 categories, built from selection chips.
// With `keepOne`, the last selected chip can't be turned off.
export function CategoryPicker({ selected, onChange, keepOne = false, labelledBy }) {
  const toggle = id => {
    const on = selected.includes(id);
    if (on && keepOne && selected.length === 1) return;
    // keep the content.json order, whatever order they were tapped in
    const next = on ? selected.filter(c => c !== id) : categories.map(c => c.id).filter(c => c === id || selected.includes(c));
    onChange(next);
  };

  return (
    <>
      <div className="chips chips--grid" role="group" aria-labelledby={labelledBy}>
        {categories.map(c => {
          const on = selected.includes(c.id);
          return (
            <button
              key={c.id}
              type="button"
              className="chip"
              data-category={c.id}
              aria-pressed={on}
              onClick={() => toggle(c.id)}
            >
              <Icon id={c.icon} className="chip__cat" />
              <span className="chip__label">{c.label}</span>
              <Icon id="check" className="chip__check" />
            </button>
          );
        })}
      </div>
      {keepOne && selected.length === 1 && (
        <p className="chips__hint">At least one category stays on. The deck needs something to deal.</p>
      )}
    </>
  );
}
