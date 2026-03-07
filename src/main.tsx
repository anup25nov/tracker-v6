import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initFirebase } from "./lib/firebase";

initFirebase();

createRoot(document.getElementById("root")!).render(<App />);
