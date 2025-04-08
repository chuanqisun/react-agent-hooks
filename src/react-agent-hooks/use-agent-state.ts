import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ZodSchema } from "zod";
import { implicitRootAgentContext } from "./agent-hooks";
import { useAgentTool } from "./use-agent-tool";

export function useAgentReadable<S>(name: string, initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
export function useAgentReadable<S = undefined>(name: string): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
export function useAgentReadable(name: string, initialState?: any) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    implicitRootAgentContext.set(name, { type: "state", data: state });
    return () => void implicitRootAgentContext.delete(name);
  }, [name, state]);

  return [state, setState];
}

export function useAgentState<S>(
  name: string,
  schema: ZodSchema<any>,
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>];
export function useAgentState<S>(
  name: string,
  schema: ZodSchema<any>,
): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
export function useAgentState(name: string, schema: ZodSchema<any>, initialState?: any) {
  const readable = useAgentState(name, initialState);
  useAgentTool(`set ${name}`, schema, readable[1]);

  return readable;
}
