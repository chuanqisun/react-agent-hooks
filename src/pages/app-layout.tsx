import { useRef, useState, type PropsWithChildren } from "react";
import { useAgentDebug } from "../react-agent-hooks/index.ts";
import { useAgent } from "../react-agent-hooks/use-agent.ts";

export function AppLayout(props: PropsWithChildren) {
  const [apiKey, setOpenaiApiKey] = useState(localStorage.getItem("react-agent:openai-api-key") ?? "");
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenaiApiKey(e.target.value);
    localStorage.setItem("react-agent:openai-api-key", e.target.value);
  };
  const [prompt, setPrompt] = useState("");
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };
  const handlePromptKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const agent = useAgent({ apiKey });
  const agentDebug = useAgentDebug();

  const handleSubmit = async () => {
    setPrompt("");
    agent.run(prompt);
  };

  const handleDebugState = () => console.log(agentDebug.dump());

  const apiKeyDialogRef = useRef<HTMLDialogElement>(null);

  return (
    <div className="c-app-layout">
      <header className="c-header-layout">
        <div>Demo</div>

        <dialog ref={apiKeyDialogRef}>
          <div className="rows">
            <label>OpenAI API Key</label>
            <input type="password" id="openai-api-key" value={apiKey} onChange={handleApiKeyChange} />
          </div>
        </dialog>
      </header>
      <main className="rows">
        <fieldset>
          <legend>Input</legend>
          <div className="rows">
            <textarea
              id="prompt"
              value={prompt}
              onChange={handlePromptChange}
              onKeyDown={handlePromptKeydown}
              placeholder="Type your prompt here..."
            />
            <div>
              <button onClick={handleSubmit}>▶️ Run</button>
              <button onClick={handleDebugState}>🐞 Debug state</button>
              <button onClick={() => apiKeyDialogRef.current?.showModal()}>🔑 Set key</button>
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>Output</legend>
          <div>{props.children}</div>
        </fieldset>
      </main>
    </div>
  );
}
