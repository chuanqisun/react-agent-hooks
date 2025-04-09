import { useContext, useEffect, useState } from "react";
import { AgentContextInternal, implicitRootAgentContext } from "./agent-context";

export function useAgentMemo<T>(
  name: string,
  factory: () => T,
  dependencies: unknown[],
  _options?: { description?: string },
): T {
  const [latestValue, setLatestValue] = useState<T>(factory());
  const context = useContext(AgentContextInternal);

  useEffect(() => {
    const newValue = factory();
    implicitRootAgentContext.set(name, { type: "state", data: newValue, context });
    setLatestValue(newValue);
    return () => void implicitRootAgentContext.delete(name);
  }, dependencies);

  return latestValue;
}
