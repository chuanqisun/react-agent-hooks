# React Agent Hooks

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/chuanqisun/react-agent-hooks?file=src%2Fmain.jsx)

Hooks that bring Agents into your React app

- 🪝 Familiar: same semantics as React hooks
- 🤝 Symbiotic: human interface and agent interface derived from the same state.
- 🛡️ Safe: developer controls the schema for Agentic state change.
- ➕ Incremental adoption: use as much or as little as you want.
- 📦 Composable: fully interoperable with classic React hooks.
- 🔮 Future-ready: forward-compatible with MCP and llms.txt.

**Before**

```jsx
import { useCallback, useState } from "react";

function MyComponent() {
  const [name, setName] = useState("John Doe");
  const [age, setAge] = useState(30);
  const increase = useCallback((increment) => setAge((prev) => prev + increment), []);

  return (
    <div>
      <h1>{name}</h1>
      <p>{age}</p>
      <button onClick={() => increase(5)}>Increase Age</button>
    </div>
  );
}
```

**After**

```jsx
import { useAgent, useAgentState, useAgentTool } from "react-agent-hooks";

export function MyComponent() {
  const agent = useAgent({ apiKey: "******" });
  const [name, setName] = useAgentState("name", "John Doe");
  const [age, setAge] = useAgentState("age", 30);
  const increase = useAgentTool("increase-age", z.object({ increment: z.number() }), (increment) =>
    setAge((prev) => prev + increment),
  );

  return (
    <div>
      <h1>{name}</h1>
      <p>{age}</p>
      <button onClick={() => agent.submit("increase the age")}>Increase Age</button>
    </div>
  );
}
```

## Get Started

```sh
npm install react-agent-hooks
```

## Usage

### Give Agent "Eyes"

```tsx
import { useAgentMemo } from "react-agent-hooks";

function MyComponent() {
  const [name, setName] = useState("John Doe");
  const [age, setAge] = useState(30);

  // Describe a readable state to the Agent
  useAgentMemo("User's profile", () => ({ name, age }), [name, age]);

  return (
    <div>
      <h1>{name}</h1>
      <p>{age}</p>
    </div>
  );
}
```

### Give Agent "Hands"

```tsx
import {z} from "zod";
import { useAgentState, useAgentTool } from "react-agent-hooks";

function MyComponent() {

  // Describe a readable state to the Agent while exposing a setter function to developer
  const [foodPreferences, setFoodPreferences] = useAgentState("food preference", ["Pizza", "Sushi"]);

  // Wrap the setter as a tool and describe it to the Agent
  const addFoodPreference = useAgentTool("add-food-preference", z.object(foodItems: z.array(z.string())), (foodItems) => {
    setFoodPreferences((prev) => [...prev, ...foodItems]);
  });
  const removeFoodPreference = useAgentTool("remove-food-preference", z.object(foodItems: z.array(z.string())), (foodItems) => {
    setFoodPreferences((prev) => prev.filter((item) => !foodItems.includes(item)));
  });

  return <ul>
    {foodPreferences.map(item => <li key={item}>{item}</li>)}
    </ul>
}
```

### Run the Agent

```tsx
import { useAgent } from "react-agent-hooks";

function MyApp() {
  // Run the Agent with a prompt
  // Agent always sees the latest states from `useAgentState`, `useAgentMemo`, and can uses the latest tools from `useAgentTool`
  const agent = useAgent({ apiKey: "******" });

  // Call the Agent
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const input = e.target.elements[0].value;
    agent.submit(input);
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input type="text" placeholder="Your request" />
      <button onClick={handleRunAgent}>Ask Agent</button>
    </form>
  );
}
```

### Compose Agentic Application

```tsx
function ParentComponent() {
  // A higher level component can dynamically decide what lower level states/tools are available
  const = [shouldShowFeature, setShouldShowFeature] = useAgentState("toggle feature", z.boolean(), true);

  useAgentTool("toggle feature", z.object({}), () => setShouldShowFeature(prev) => !prev);

  return <AppRoot>{shouldShowFeatureB ? <ChildComponent /> : null}</AppRoot>;
}

function ChildComponent() {
  // The state and tool will be available to the Agent only if the child component is rendered
  useAgentState("some state", { name: "Some state" });
  useAgentTool("update state", z.object({ name: z.string() }), (newState) => {
    setSomeState(newState);
  });

  return <div>...</div>;
}
```

### Scale-up with Context

The `AgentContext` is optionally React Context to help you
hierarchically organizing states and tools. This can reduce
error when working with large number of states and tools.

```tsx
import { AgentContext } from "react-agent-hooks";

function MyApp() {
  return (
    <AgentContext name="app root">
      <AgentContext name="nav">
        <Nav />
      </AgentContext>
      <AgentContext name="content">
        <header>
          <AgentContext name="header">
            <HeaderContent />
          </AgentContext>
        </header>
        <main>
          <AgentContext name="main">
            <MainContent />
          </AgentContext>
        </main>
      </AgentContext>
    </AgentContext>
  );
}

function HeaderContent() {
  // The Agent will see this state appear within the "app root > nav > header" context
  const [someState, setSomeState] = useAgentState("some state", { name: "Some state" });
  return <div>...</div>;
}
```

### Future Work

Render to MCP Server

```tsx
import { renderToMCPServer } from "react-agent-hooks";

function main() {
  // Spin up an MCP server at port 3000.
  // React Agent state -> MCP resource and prompts
  // React Agent tools -> MCP tools
  const server = renderToMCPServer(<App />).listen(3000);
}
```

Render to llms.txt

```tsx
import { renderToLlmsTxt } from "react-agent-hooks";

function main() {
  server.get("/llms.txt", (req, res) => {
    const userContext = req.query.userContext;
    const llmsTxtContent = renderToLlmsTxt(<App context={userContext} />);
    res.send(llmsTxtContent);
  });
}
```
