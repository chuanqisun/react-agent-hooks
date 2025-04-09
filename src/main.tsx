import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppLayout } from "./pages/app-layout";
import { TabSwitchDemo } from "./pages/tab-switch-demo";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppLayout>
      <TabSwitchDemo />
    </AppLayout>
  </StrictMode>,
);
