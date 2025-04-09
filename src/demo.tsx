import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import "./index.css";
import { useAgent, useAgentState, useAgentTool } from "./react-agent-hooks";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

function App() {
  const [chatHistory, setChatHistory] = useAgentState("chat-history", [] as { role: string; content: string }[]);
  const agent = useAgent({ apiKey: localStorage.getItem("react-agent:openai-api-key") || "" });

  const sendMessage = (message: string) => {
    setChatHistory((prev) => [
      ...prev,
      {
        role: "user",
        content: message,
      },
    ]);

    agent.run("simulate chat response please");
  };

  useAgentTool("simulate-response", z.object({ response: z.string() }), (args) => {
    setChatHistory((prev) => [
      ...prev,
      {
        role: "assistant",
        content: args.response,
      },
    ]);
  });

  return (
    <div>
      {chatHistory.map((item, index) => (
        <div key={index} className={item.role}>
          {item.role}: {item.content}
        </div>
      ))}
      <input
        type="text"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            sendMessage((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).value = "";
          }
        }}
      />
    </div>
  );
}
