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
