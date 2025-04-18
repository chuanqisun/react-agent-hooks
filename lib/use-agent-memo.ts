import { useContext, useEffect, useState } from "react";
import { AgentContextInternal, implicitRootAgentContext } from "./agent-context";
import { getPathKey } from "./get-path-key";

export function useAgentMemo<T>(
  name: string,
  factory: () => T,
  dependencies: unknown[],
  options?: {
    /** Explicitly show/hide the state from the agent */
    description?: string;
    enabled?: boolean;
  },
): T {
  const [latestValue, setLatestValue] = useState<T>(factory());
  const context = useContext(AgentContextInternal);
  const { prefix, path } = getPathKey(context.breadcrumbs, name);

  useEffect(() => {
    if (options?.enabled === false) return void implicitRootAgentContext.delete(path);

    const newValue = factory();
    implicitRootAgentContext.set(path, {
      name,
      prefix,
      type: "state",
      data: newValue,
      context,
      description: options?.description,
    });
    setLatestValue(newValue);

    return () => void implicitRootAgentContext.delete(path);
  }, [path, prefix, name, options?.enabled, options?.description, ...dependencies]);

  return latestValue;
}
