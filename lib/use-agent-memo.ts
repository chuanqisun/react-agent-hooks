import { useContext, useEffect, useId, useState } from "react";
import { AgentContextInternal, implicitRootAgentContext } from "./agent-context";
import { getPathPrefix } from "./get-path-prefix";

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
  const prefix = getPathPrefix(context.breadcrumbs);
  const id = useId();

  useEffect(() => {
    if (options?.enabled === false) return void implicitRootAgentContext.delete(id);

    const newValue = factory();
    implicitRootAgentContext.set(id, {
      name,
      prefix,
      type: "state",
      data: newValue,
      context,
      description: options?.description,
    });
    setLatestValue(newValue);

    return () => void implicitRootAgentContext.delete(id);
  }, [id, prefix, name, options?.enabled, options?.description, ...dependencies]);

  return latestValue;
}
