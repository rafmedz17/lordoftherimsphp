import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { useAuthStore } from "./features/auth/stores/authStore";
import "./index.css";

// Restore the login session (if any) from the PHP session cookie.
useAuthStore.getState().checkSession();

createRoot(document.getElementById("root")!).render(<App />);
