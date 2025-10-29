import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { SidebarProvider } from "@/context/SidebarContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <SidebarProvider>
    <App />
  </SidebarProvider>
);
