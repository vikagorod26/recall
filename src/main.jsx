import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";

// pause decorative loops (the border beam) while the app is in the background
const syncHidden = () => document.documentElement.toggleAttribute("data-hidden", document.hidden);
document.addEventListener("visibilitychange", syncHidden);
syncHidden();

createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>);
