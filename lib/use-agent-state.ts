import type { Dispatch, SetStateAction } from "react";
import { useContext, useEffect, useId, useState } from "react";
import { AgentContextInternal, implicitRootAgentContext } from "./agent-context";
import { getPathPrefix } from "./get-path-prefix";

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
  const prefix = getPathPrefix(context.breadcrumbs);
  const id = useId();

  useEffect(() => {
    if (options?.enabled === false) return void implicitRootAgentContext.delete(id);

    implicitRootAgentContext.set(id, {
      name,
      prefix,
      type: "state",
      data: state,
      context,
      description: options?.description,
    });

    return () => void implicitRootAgentContext.delete(id);
  }, [id, prefix, name, state, options?.enabled, options?.description]);

  return [state, setState];
}
