import { createContext, StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import "./index.css";

const AgentStateContext = createContext({});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AgentStateContext value={{}}>
      <App />
    </AgentStateContext>
  </StrictMode>,
);

function useAgentState(name: string, schema: any, initialValue: any) {
  const [state, setState] = useState<any>(initialValue);
  return [state, setState];
}

function App() {
  const [tab, setTab] = useAgentState(
    "activeTab",
    {
      activeTabName: z.enum(["tab1", "tab2", "tab3"]),
    },
    "tab1",
  );

  return (
    <>
      <div>
        <textarea className="input-box"></textarea>
        <button>Submit</button>
        <button onClick={() => setTab("tab1")}>1</button>
        <button onClick={() => setTab("tab2")}>2</button>
        <button onClick={() => setTab("tab3")}>3</button>
        <div>ActiveTab: {tab}</div>
      </div>
    </>
  );
}
