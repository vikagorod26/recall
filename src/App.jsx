import { useEffect, useState } from "react";
import { Onboarding } from "./screens/Onboarding.jsx";
import { MainScreen } from "./screens/MainScreen.jsx";
import { Settings } from "./screens/Settings.jsx";
import { Splash } from "./components/Splash.jsx";
import { loadPrefs, resetAll, savePrefs } from "./lib/storage.js";

// Launch: splash (long on first launch, short after), fading out over the
// first screen. Screens: onboarding (first launch) -> main <-> settings.
// Settings gets its own history entry, so the phone's back gesture closes it.
export function App() {
  const [prefs, setPrefs] = useState(loadPrefs);
  const [screen, setScreen] = useState(() => (loadPrefs() ? "main" : "onboarding"));
  const [splash, setSplash] = useState(true);
  const [firstLaunch] = useState(() => !loadPrefs());

  useEffect(() => {
    const onPop = () => setScreen(s => (s === "settings" ? "main" : s));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  const finishOnboarding = categories => {
    savePrefs({ categories });
    setPrefs(loadPrefs() ?? { categories, onboarded: true }); // works even if storage is blocked
    setScreen("main");
  };

  const changeCategories = categories => {
    const next = { ...prefs, categories };
    savePrefs(next);
    setPrefs(next);
  };

  const openSettings = () => {
    history.pushState({ screen: "settings" }, "");
    setScreen("settings");
  };

  const reset = () => {
    resetAll();
    setPrefs(null);
    setScreen("onboarding");
  };

  let view;
  if (screen === "onboarding" || !prefs) view = <Onboarding onDone={finishOnboarding} />;
  else if (screen === "settings") {
    view = (
      <Settings
        categories={prefs.categories}
        onCategoriesChange={changeCategories}
        onReset={reset}
        onBack={() => history.back()}
      />
    );
  } else view = <MainScreen categories={prefs.categories} onOpenSettings={openSettings} />;

  return (
    <>
      <div className="screen-host" inert={splash || undefined}>{view}</div>
      {splash && <Splash long={firstLaunch} onDone={() => setSplash(false)} />}
    </>
  );
}
