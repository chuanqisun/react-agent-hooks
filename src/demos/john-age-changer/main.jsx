import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import { useAgent, useAgentState, useAgentTool } from "../../../lib";
import "./index.css";

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("react-agent-hooks:openai-api-key") ?? "");
  const agent = useAgent({ apiKey });
  const [userProfile, setUserProfile] = useAgentState("User profile", { name: "John", age: 24 });
  useAgentTool(
    "Update user age to be older or younger",
    z.object({ newAge: z.number().describe("the new age after the update").max(150).min(0) }),
    (update) => setUserProfile((prev) => ({ ...prev, age: update.newAge })),
  );

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
        {userProfile.name} is currently {userProfile.age} years old
      </div>
      <button onClick={() => agent.run("Grow much younger")} type="button">
        Grow much younger
      </button>
      <button onClick={() => agent.run("Grow younger")} type="button">
        Grow younger
      </button>
      <button onClick={() => agent.run("Grow older")} type="button">
        Grow older
      </button>
      <button onClick={() => agent.run("Grow much older")} type="button">
        Grow much older
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
