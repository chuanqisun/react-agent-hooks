import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { useRef, useState } from "react";
import { NavLink, Outlet } from "react-router";
import { useAgentDebug } from "../react-agent-hooks/agent-hooks";
import { useAgent } from "../react-agent-hooks/use-agent.ts";

export function AppLayout() {
  const [apiKey, setOpenaiApiKey] = useState(localStorage.getItem("react-agent:openai-api-key") ?? "");
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenaiApiKey(e.target.value);
    localStorage.setItem("react-agent:openai-api-key", e.target.value);
  };
  const [prompt, setPrompt] = useState("");
  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const agent = useAgent({ apiKey });
  const agentDebug = useAgentDebug();

  const handleSubmit = async () => {
    setPrompt("");
    agent.run(prompt);
  };

  const handlePromptKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleDebugState = () => console.log(agentDebug.dump());

  const apiKeyDialogRef = useRef<HTMLDialogElement>(null);

  return (
    <NuqsAdapter>
      <div className="c-app-layout">
        <header className="c-header-layout">
          <NavLink to="/">🅰️</NavLink>
          <div>
            <input
              type="search"
              placeholder="Search, ask, or run..."
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handlePromptKeydown}
            />
          </div>

          <div>
            <button onClick={handleDebugState}>🐞</button>
            <button onClick={() => apiKeyDialogRef.current?.showModal()}>⚙️</button>
          </div>

          <dialog ref={apiKeyDialogRef}>
            <div className="rows">
              <label>OpenAI API Key</label>
              <input type="password" id="openai-api-key" value={apiKey} onChange={handleApiKeyChange} />
            </div>
          </dialog>
        </header>
        <nav>
          <div className="c-nav">
            <NavLink to="/templates">Templates</NavLink>
            <NavLink to="/agents">Agents</NavLink>
            <NavLink to="/workflows">Workflows</NavLink>
            <NavLink to="/builder">Builder</NavLink>
          </div>
        </nav>
        <main>
          <Outlet />
        </main>
      </div>
    </NuqsAdapter>
  );
}
