import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import { useAgent, useAgentState, useAgentTool } from "../../../lib";
import "./index.css";

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("react-agent-hooks:openai-api-key") ?? "");
  const agent = useAgent({ apiKey });
  const [idea, setIdea] = useAgentState("The idea", "Use React Hooks as a state management library for LLM agents.");
  useAgentTool("Adjust idea", z.string().describe("The updated idea"), setIdea);

  const beMoreCreative = () => agent.run("Come up with a more creative version, keep it short");
  const beMoreConservative = () => agent.run("Come up with a more conservative version, keep it short");

  return (
    <div>
      <label htmlFor="api-key">Open AI API Key (doesn't leave browser)</label>
      <br />
      <input
        id="api-key"
        type="password"
        autoComplete="off"
        value={apiKey}
        onChange={(e) => {
          setApiKey(e.target.value);
          localStorage.setItem("react-agent-hooks:openai-api-key", e.target.value);
        }}
      />
      <br />
      <br />
      <div>{idea}</div>
      <button onClick={beMoreConservative} type="button">
        Be more conservative
      </button>
      <button onClick={beMoreCreative} type="button">
        Be more creative
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
