import type { Dispatch, SetStateAction } from "react";
import { useContext, useEffect, useState } from "react";
import { AgentContextInternal, implicitRootAgentContext } from "./agent-context";
import { getPathKey } from "./get-path-key";

export function useAgentState<S>(
  name: string,
  initialState?: S | (() => S),
  options?: {
    /** Explicitly show/hide the state from the agent */
    enabled?: boolean;
    description?: string;
  },
): [S, Dispatch<SetStateAction<S>>];
export function useAgentState<S = undefined>(name: string): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
export function useAgentState(name: string, initialState?: any, options?: { enabled?: boolean; description?: string }) {
  const [state, setState] = useState(initialState);
  const context = useContext(AgentContextInternal);
  const { prefix, path } = getPathKey(context.breadcrumbs, name);

  useEffect(() => {
    if (options?.enabled === false) return void implicitRootAgentContext.delete(path);

    implicitRootAgentContext.set(path, {
      name,
      prefix,
      type: "state",
      data: state,
      context,
      description: options?.description,
    });

    return () => void implicitRootAgentContext.delete(path);
  }, [path, prefix, name, state, options?.enabled, options?.description]);

  return [state, setState];
}
