import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { implicitRootAgentContext } from "./agent-hooks";

export function useAgentState<S>(name: string, initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
export function useAgentState<S = undefined>(name: string): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
export function useAgentState(name: string, initialState?: any) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    implicitRootAgentContext.set(name, { type: "state", data: state });
    return () => void implicitRootAgentContext.delete(name);
  }, [name, state]);

  return [state, setState];
}
