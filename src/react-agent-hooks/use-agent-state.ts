import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ZodSchema } from "zod";
import { implicitRootAgentContext } from "./agent-hooks";
import { useAgentTool } from "./use-agent-tool";

export function useAgentState<S>(name: string, inititialState?: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
export function useAgentState(name: string, schema?: ZodSchema<any>, init?: any): [any, any];
export function useAgentState(name: string, schemaOrInit?: any, init?: any) {
  // case 1, no schemaOrInit
  if (schemaOrInit === undefined) return useAgentReadableState(name, init);

  if (schemaOrInit instanceof ZodSchema) {
    // case 2, 2nd arg schema
    return useAgentReadwriteState(name, schemaOrInit, init);
  } else {
    // case 3, 2nd arg is init
    return useAgentReadableState(name, schemaOrInit);
  }
}

// case 1 implementation
function useAgentReadableState<S>(name: string, initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
function useAgentReadableState<S = undefined>(name: string): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
function useAgentReadableState(name: string, initialState?: any) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    implicitRootAgentContext.set(name, { type: "state", data: state });
    return () => void implicitRootAgentContext.delete(name);
  }, [name, state]);

  return [state, setState];
}

// case 2 implementation
function useAgentReadwriteState<S>(
  name: string,
  schema: ZodSchema<any>,
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>];
function useAgentReadwriteState<S>(
  name: string,
  schema: ZodSchema<any>,
): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
function useAgentReadwriteState(name: string, schema: ZodSchema<any>, initialState?: any) {
  const readable = useAgentReadwriteState(name, initialState);
  useAgentTool(`set ${name}`, schema, readable[1]);

  return readable;
}
