# React Agent Hooks

Augment your UI for Agent interaction.

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

  return <>UI goes here...</>;
}
```

### Give Agent the "hands"

```tsx
import {z} from "zod";
import { useAgentState, useAgentTool } from "react-agent-hooks";

function MyComponent() {

  // states are visible to Agent and shares the identical iterface to react useState hook
  const [foodPreferences, setFoodPreferences] = useAgentState(["Pizza", "Sushi"]);

  // tools let Agent call any functions, including those that change the change
  useAgentTool("add-food-preference", z.object(foodItems: z.array(z.string())), (foodItems) => {
    setFoodPreferences((prev) => [...prev, ...foodItems]);
  });
  useAgentTool("remove-food-preference", z.object(foodItems: z.array(z.string())), (foodItems) => {
    setFoodPreferences((prev) => prev.filter((item) => !foodItems.includes(item)));
  });

  return <>UI goes here...</>;
}
```

### Run the Agent

```tsx
import { useAgent } from "react-agent-hooks";

function MyApp() {
  // Run the Agent with a prompt
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
