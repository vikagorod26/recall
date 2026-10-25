import { CategoryPicker } from "../components/CategoryPicker.jsx";
import { TwoStepButton } from "../components/Buttons.jsx";
import { ScreenHeader } from "../components/ScreenHeader.jsx";

export function Settings({ categories, onCategoriesChange, onReset, onBack }) {
  return (
    <div className="screen screen--settings">
      <ScreenHeader title="Settings" onBack={onBack} />

      <section className="settings-section">
        <h2 className="section-label" id="settings-categories">Categories</h2>
        <CategoryPicker selected={categories} onChange={onCategoriesChange} keepOne labelledBy="settings-categories" />
        <p className="settings-note">Saved right away. The deck only deals tips from these.</p>
      </section>

      <section className="settings-section">
        <h2 className="section-label">Start over</h2>
        <TwoStepButton armedLabel="Tap again to reset" onConfirm={onReset}>Reset app</TwoStepButton>
        <p className="settings-note">Clears your categories and the tips you've seen on this device, then shows the intro again. Your LP stays exactly where it is.</p>
      </section>

      <section className="settings-section">
        <h2 className="section-label">About</h2>
        <p className="settings-note">Recall is a fan-made project, not endorsed by Riot Games. League of Legends is a trademark of Riot Games, Inc. Everything you pick stays on this device.</p>
      </section>
    </div>
  );
}
