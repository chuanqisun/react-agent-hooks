import type { Dispatch, SetStateAction } from "react";
import { useContext, useEffect, useState } from "react";
import { AgentContextInternal, implicitRootAgentContext } from "./agent-context";

export function useAgentState<S>(name: string, initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
export function useAgentState<S = undefined>(name: string): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
export function useAgentState(name: string, initialState?: any) {
  const [state, setState] = useState(initialState);
  const context = useContext(AgentContextInternal);

  useEffect(() => {
    implicitRootAgentContext.set(name, { type: "state", data: state, context });
    return () => void implicitRootAgentContext.delete(name);
  }, [name, state]);

  return [state, setState];
}
