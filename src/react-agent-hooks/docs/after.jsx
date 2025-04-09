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
