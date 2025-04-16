import { useContext, useEffect, useState } from "react";
import { AgentContextInternal, implicitRootAgentContext } from "./agent-context";

export function useAgentMemo<T>(
  name: string,
  factory: () => T,
  options?: {
    /** Explicitly show/hide the state from the agent */
    enabled?: boolean;
    /** When dependencies are not provided, the effect will run on every render. */
    dependencies?: unknown[];
  },
): T {
  const [latestValue, setLatestValue] = useState<T>(factory());
  const context = useContext(AgentContextInternal);

  useEffect(
    () => {
      if (options?.enabled === false) return void implicitRootAgentContext.delete(name);

      const newValue = factory();
      implicitRootAgentContext.set(name, { type: "state", data: newValue, context });
      setLatestValue(newValue);
      return () => void implicitRootAgentContext.delete(name);
    },
    options?.dependencies ? [name, ...options.dependencies, options?.enabled] : undefined,
  );

  return latestValue;
}
