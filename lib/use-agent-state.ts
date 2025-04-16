import type { Dispatch, SetStateAction } from "react";
import { useContext, useEffect, useState } from "react";
import { AgentContextInternal, implicitRootAgentContext } from "./agent-context";

export function useAgentState<S>(
  name: string,
  options?: { initialState: S | (() => S); enabled?: boolean },
): [S, Dispatch<SetStateAction<S>>];
export function useAgentState<S = undefined>(name: string): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
export function useAgentState(name: string, options?: { initialState?: any; enabled?: boolean }) {
  const [state, setState] = useState(options?.initialState);
  const context = useContext(AgentContextInternal);

  useEffect(() => {
    if (options?.enabled === false) return void implicitRootAgentContext.delete(name);

    implicitRootAgentContext.set(name, { type: "state", data: state, context });
    return () => void implicitRootAgentContext.delete(name);
  }, [name, state, options?.enabled]);

  return [state, setState];
}
