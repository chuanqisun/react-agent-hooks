import { createContext, Dispatch, SetStateAction, useEffect, useState } from "react";
import { ZodSchema } from "zod";

export type AgentItem = AgentStateItem | AgentToolItem;
export interface AgentStateItem {
  type: "state";
  data: any;
}
export interface AgentToolItem {
  type: "tool";
  params: ZodSchema<any>;
  callback: (args: any) => any;
}

export interface ExplicitAgentContext {
  breadcrumbs: string[]; // top-down, including self
}

export const AgentContext = createContext;

export const implicitRootAgentContext = new Map<string, AgentItem>();

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

export function useAgentTool(name: string, params: ZodSchema<any>, callback: (params: any) => any) {
  useEffect(() => {
    implicitRootAgentContext.set(name, { type: "tool", params, callback });
    return () => void implicitRootAgentContext.delete(name);
  }, [name, params, callback]);

  return callback;
}

export function useAgentMemo<T>(name: string, factory: () => T, depsList?: unknown[]): T {
  const [latestValue, setLatestValue] = useState<T>(factory());

  useEffect(
    () => {
      const newValue = factory();
      implicitRootAgentContext.set(name, { type: "state", data: newValue });
      setLatestValue(newValue);
      return () => void implicitRootAgentContext.delete(name);
    },
    depsList ? [name, factory, ...depsList] : (undefined as any),
  );

  return latestValue;
}

export function useAgentDebug() {
  const dump = () => {
    return Object.fromEntries(implicitRootAgentContext.entries());
  };

  return {
    dump,
  };
}
