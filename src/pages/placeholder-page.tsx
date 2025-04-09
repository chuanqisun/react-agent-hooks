import { z } from "zod";
import demoData from "../data/main.json";
import { useAgentState, useAgentTool } from "../react-agent-hooks";

export function PlaceholderPage() {
  const [tab, setTab] = useAgentState("activeTab", { intialValue: "tab1" });

  useAgentTool("switchTab", {
    params: z.object({ activeTab: z.enum(["tab1", "tab2", "tab3"]) }),
    run: async ({ activeTab }) => setTab(activeTab),
  });

  return (
    <>
      <div className="rows">
        <div>
          <button onClick={() => setTab("tab1")}>Templates</button>
          <button onClick={() => setTab("tab2")}>Agents</button>
          <button onClick={() => setTab("tab3")}>Workflows</button>
          <button onClick={() => setTab("tab3")}>Builder</button>
        </div>
        <div>ActiveTab: {tab}</div>

        {tab === "tab1" && (
          <div>
            <h2>Tempaltes</h2>
          </div>
        )}

        {tab === "tab2" && (
          <div>
            <h2>Agents</h2>
            <pre>
              <code>{JSON.stringify(demoData.agents, null, 2)}</code>
            </pre>
          </div>
        )}

        {tab === "tab3" && (
          <div>
            <h2>Workflows</h2>
            <pre>
              <code>{JSON.stringify([])}</code>
            </pre>
          </div>
        )}

        {tab === "tab4" && (
          <div>
            <h2>Builder</h2>
            <pre>
              <code>{JSON.stringify([])}</code>
            </pre>
          </div>
        )}
      </div>
    </>
  );
}
