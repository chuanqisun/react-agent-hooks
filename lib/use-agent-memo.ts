import { useContext, useEffect, useState } from "react";
import { AgentContextInternal, implicitRootAgentContext } from "./agent-context";

export function useAgentMemo<T>(
  name: string,
  factory: () => T,
  dependencies: unknown[],
  options?: {
    /** Explicitly show/hide the state from the agent */
    enabled?: boolean;
  },
): T {
  const [latestValue, setLatestValue] = useState<T>(factory());
  const context = useContext(AgentContextInternal);

  useEffect(() => {
    if (options?.enabled === false) return void implicitRootAgentContext.delete(name);

    const newValue = factory();
    implicitRootAgentContext.set(name, { type: "state", data: newValue, context });
    setLatestValue(newValue);
    return () => void implicitRootAgentContext.delete(name);
  }, [name, ...dependencies, options?.enabled]);

  return latestValue;
}
