import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initFirebase } from "./lib/firebase";

// Apply saved theme or default to light
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.documentElement.classList.add("dark");
}
// Default is light (no class needed)

initFirebase();

createRoot(document.getElementById("root")!).render(<App />);
