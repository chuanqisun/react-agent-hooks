import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { z } from "zod";
import { useAgent, useAgentDebug, useAgentState, useAgentTool } from "../lib";
import "./index.css";

let taskId = 0;

function App() {
  const [apiKey, setApiKey] = useState(localStorage.getItem("react-agent-hooks:openai-api-key") ?? "");

  const [tasks, setTasks] = useAgentState("My tasks", []);

  const addTask = useAgentTool("Add task", z.string().describe("The title of the task"), (title) =>
    setTasks((prevTasks) => [...prevTasks, { id: ++taskId, title, isDone: false }]),
  );

  const deleteTask = useAgentTool("Delete task", z.number().describe("ID of the task to be deleted"), (id) =>
    setTasks((prevTasks) => prevTasks.filter((t) => t.id !== id)),
  );

  const toggleIsDone = useAgentTool(
    "Toggle is task done",
    z.number().describe("ID of the task to toggle between done/todo"),
    (id) =>
      setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, isDone: !task.isDone } : task))),
  );

  const editTaskTitle = useAgentTool(
    "Edit task title",
    z.object({
      id: z.number().describe("ID of the task whose title to be edited"),
      title: z.string().describe("The updated title"),
    }),
    ({ id, title }) => setTasks((prevTasks) => prevTasks.map((task) => (task.id === id ? { ...task, title } : task))),
  );

  const handleHumanEdit = (id) => {
    const updated = prompt("Title", tasks.find((t) => t.id === id)?.title);
    if (updated === null) return;

    editTaskTitle({ id, title: updated });
  };

  const handleHumanAddTask = () => {
    const taskTitle = prompt("Title");
    if (!taskTitle) return;

    addTask(taskTitle);
  };

  const agent = useAgent({ apiKey });
  const { debugText } = useAgentDebug();
  const [agentPrompt, setAgentPrompt] = useState("");
  const [lastAgentOutput, setLastAgentOutput] = useState(null);

  const handleSendToAgent = (prompt) => agent.run(prompt, { onChatResponse: setLastAgentOutput });

  // print shared space
  useEffect(() => {
    const clearId = setInterval(((document.querySelector("#agent-state").textContent = debugText()), 100));

    return () => clearInterval(clearId);
  }, [debugText]);

  return (
    <div className="app-layout">
      <div className="human-space">
        <h2>Human space</h2>
        <button onClick={handleHumanAddTask}>➕ Add task</button>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              <label>
                <input type="checkbox" checked={task.isDone} onChange={() => toggleIsDone(task.id)} />
                {task.title}
              </label>
              <button onClick={() => handleHumanEdit(task.id)}>✏️</button>
              <button onClick={() => deleteTask(task.id)}>🗑️</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="agent-space">
        <h2>Agent space</h2>
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
          <div>Status: {agent.status}</div>
          {lastAgentOutput ? <div>🤖 {lastAgentOutput}</div> : null}

          <b>Examples</b>
          <button onClick={(e) => handleSendToAgent(e.target.textContent)}>Remind me to pick up kids at 5</button>
          <button onClick={(e) => handleSendToAgent(e.target.textContent)}>I need to buy breakfast items</button>
          <button onClick={(e) => handleSendToAgent(e.target.textContent)}>
            Add example planning tasks for my upcoming honeymoon
          </button>
          <button onClick={(e) => handleSendToAgent(e.target.textContent)}>
            Break down the 1st task into smaller ones
          </button>
          <button onClick={(e) => handleSendToAgent(e.target.textContent)}>Mark all shoppping tasks as done</button>
          <button onClick={(e) => handleSendToAgent(e.target.textContent)}>Mark last two items as done</button>
          <button onClick={(e) => handleSendToAgent(e.target.textContent)}>Delete all the "done" tasks</button>
        </div>
      </div>
      <div className="shared-space">
        <h2>Shared space</h2>
        <pre id="agent-state"></pre>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
