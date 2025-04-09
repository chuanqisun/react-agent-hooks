import { z } from "zod";
import { useAgentState, useAgentTool } from "../react-agent-hooks";

export function TabSwitchDemo() {
  const [tab, setTab] = useAgentState("activeTab", "tab1");
  useAgentTool("switchTab", z.enum(["tab1", "tab2", "tab3", "tab4"]), async (activeTab) => setTab(activeTab));

  return (
    <>
      <div className="rows">
        <div>
          <button onClick={() => setTab("tab1")}>Tab 1</button>
          <button onClick={() => setTab("tab2")}>Tab 2</button>
          <button onClick={() => setTab("tab3")}>Tab 3</button>
          <button onClick={() => setTab("tab3")}>Tab 4</button>
        </div>
        <div>ActiveTab: {tab}</div>
      </div>
    </>
  );
}
