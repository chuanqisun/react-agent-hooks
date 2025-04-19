import { StrictMode, useCallback, useState } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import { useAgent, useAgentState, useAgentTool } from "../../../lib";
import "./index.css";

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("react-agent-hooks:openai-api-key") ?? "");
  const agent = useAgent({ apiKey });
  const [person, setPerson] = useAgentState("Person", {
    name: "John",
    age: 24,
  });

  useAgentTool(
    `Update the person's age to be older or younger`,
    z.object({
      delta: z.number().describe("positive to grow older, negative to grow younger"),
    }),
    (update) => setPerson((prev) => ({ ...prev, age: prev.age + update.delta })),
  );

  const runAgent = useCallback((event) => agent.run(event.target.textContent), []);

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
      <div>
        {person.name} is currently {person.age} years old
      </div>
      <button onClick={runAgent}>Grow much younger</button>
      <button onClick={runAgent}>Grow younger</button>
      <button onClick={runAgent}>Grow older</button>
      <button onClick={runAgent}>Grow much older</button>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
