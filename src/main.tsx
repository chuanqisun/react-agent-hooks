import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import "./index.css";
import { useAgent, useAgentResource, useAgentTool } from "./react-agent-hooks/use-agent";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

function App() {
  const [tab, setTab] = useAgentResource("activeTab", "tab1");

  useAgentTool(
    "switchTab",
    z.object({
      activeTab: z.enum(["tab1", "tab2", "tab3"]),
    }),
    async ({ activeTab }) => setTab(activeTab),
  );

  const [apiKey, setOpenaiApiKey] = useState(localStorage.getItem("react-agent:openai-api-key") ?? "");
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenaiApiKey(e.target.value);
    localStorage.setItem("react-agent:openai-api-key", e.target.value);
  };

  const [debugStateValue, setDebugStateValue] = useState("");
  const handleDebugState = () => setDebugStateValue(agent.debug());

  const [prompt, setPrompt] = useState("");
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const agent = useAgent({ apiKey });

  const handleSubmit = async () => {
    setPrompt("");
    agent.run(prompt);
  };

  return (
    <>
      <div className="rows">
        <div className="field">
          <label>OpenAI API Key</label>
          <input type="password" id="openai-api-key" value={apiKey} onChange={handleApiKeyChange} />
        </div>

        <div className="field">
          <label>Prompt</label>
          <textarea className="input-box" value={prompt} onChange={handlePromptChange}></textarea>
          <button onClick={handleSubmit}>Submit</button>
        </div>

        <div>
          <button onClick={() => setTab("tab1")}>1</button>
          <button onClick={() => setTab("tab2")}>2</button>
          <button onClick={() => setTab("tab3")}>3</button>
        </div>
        <div>ActiveTab: {tab}</div>

        <button onClick={handleDebugState}>Debug state</button>
        <pre>
          <code>{debugStateValue}</code>
        </pre>
      </div>
    </>
  );
}
