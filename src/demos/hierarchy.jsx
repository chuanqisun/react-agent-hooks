import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import { AgentContext, useAgent, useAgentDebug, useAgentState, useAgentTool } from "../../lib";
import "./hierarchy.css";

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("react-agent-hooks:openai-api-key") ?? "");
  const agent = useAgent({ apiKey });
  const debug = useAgentDebug();
  const [agentPrompt, setAgentPrompt] = useState("");
  const [lastAgentOutput, setLastAgentOutput] = useState(null);

  const handleSendToAgent = (prompt) =>
    agent.run(prompt).then(async (stream) => {
      setLastAgentOutput("");
      for await (const chunk of stream) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (!content) continue;
        setLastAgentOutput((prev) => prev + content);
      }
    });

  // print shared space
  useEffect(() => {
    const clearId = setInterval(((document.querySelector("#agent-state").textContent = debug.debugText()), 100));

    return () => clearInterval(clearId);
  }, [debug.debugText]);

  return (
    <div className="app-layout">
      <div className="human-space">
        <ul>
          <Item name="feature 1" />
          <Item name="feature 2" />
          <Item name="feature 3" />
        </ul>
      </div>
      <div className="agent-space">
        <h2>Control</h2>
        <div className="rows">
          <label>Open AI API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              localStorage.setItem("react-agent-hooks:openai-api-key", e.target.value);
            }}
          />
          <label>Message</label>
          <input
            placeholder="Ask or run anything"
            type="text"
            value={agentPrompt}
            onChange={(e) => setAgentPrompt(e.target.value)}
          />

          <button onClick={() => handleSendToAgent(agentPrompt)}>▶️ Send to agent</button>

          {lastAgentOutput ? <div>🤖 {lastAgentOutput}</div> : null}
        </div>
      </div>
      <div className="shared-space">
        <h2>State</h2>
        <pre id="agent-state"></pre>
      </div>
    </div>
  );
}

function Item(props) {
  const [items, setItems] = useAgentState("items", ["Item 1", "Item 2", "Item 3"]);
  useAgentTool("update-items", z.object({ items: z.array(z.string()) }), (data) => setItems(data.items));

  return (
    <AgentContext name={props.name}>
      <li>
        {props.name}
        <ul>
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </li>
    </AgentContext>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
