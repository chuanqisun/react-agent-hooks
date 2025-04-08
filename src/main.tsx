import { StrictMode, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, NavLink, Outlet, RouterProvider, useParams } from "react-router";
import { z } from "zod";
import demoData from "./data/main.json";
import "./index.css";
import { useAgent, useAgentState, useAgentTool } from "./react-agent-hooks/use-agent";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/templates" />,
      },
      {
        path: "/templates",
        element: <App />,
      },
      {
        path: "/agents",
        element: <App />,
      },
      {
        path: "/agents/:agentId",
        element: <RedirectToAgentBuild />,
      },
      {
        path: "/agents/:agentId/build",
        element: <App />,
      },
      {
        path: "/workflows",
        element: <App />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

function RedirectToAgentBuild() {
  const params = useParams();
  return <Navigate replace to={`/agents/${params.agentId}/build`} />;
}

function AppLayout() {
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

  const handleSubmit = async () => {
    setPrompt("");
    agent.run(prompt);
  };

  const handlePromptKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleDebugState = () => console.log(agent.debug());

  const apiKeyDialogRef = useRef<HTMLDialogElement>(null);

  return (
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
  );
}

function App() {
  const [tab, setTab] = useAgentState("activeTab", "tab1");

  useAgentTool(
    "switchTab",
    z.object({
      activeTab: z.enum(["tab1", "tab2", "tab3"]),
    }),
    async ({ activeTab }) => setTab(activeTab),
  );

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
