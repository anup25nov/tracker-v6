import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initFirebase } from "./lib/firebase";
import { initFeatureFlags } from "./lib/featureFlags";
import { setupGlobalErrorLogging } from "./lib/firestoreErrorLog";
import ErrorBoundary from "./components/ErrorBoundary";

// Apply saved theme or default to dark
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

initFirebase();
initFeatureFlags();
setupGlobalErrorLogging();

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
