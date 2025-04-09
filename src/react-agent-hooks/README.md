# React Agent Hooks

Augment your UI for Agent interaction.

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

### Give Agent the "eyes"

```tsx
import { useAgentMemo } from "react-agent-hooks";

function MyComponent() {
  const [name, setName] = useState("John Doe");
  const [age, setAge] = useState(30);

  // Show Agent an existing state
  useAgentMemo("User's profile", () => ({ name, age }), [name, age]);

  return (
    <div>
      <h1>{name}</h1>
      <p>{age}</p>
    </div>
  );
}
```

### Give Agent the "hands"

```tsx
import {z} from "zod";
import { useAgentState, useAgentTool } from "react-agent-hooks";

function MyComponent() {

  // fully compatible with react useState. In addition, exposing the state for Agent to read.
  const [foodPreferences, setFoodPreferences] = useAgentState("food preference", ["Pizza", "Sushi"]);

  // returns callback for developer to use in code. In addition, exposing the callback for Agent to use.
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
  // This Agent can see all the values from `useAgentState`, `useAgentMemo`, and can use any tool from `useAgentTool`
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
