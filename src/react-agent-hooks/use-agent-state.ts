import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ZodSchema } from "zod";
import { implicitRootAgentContext } from "./agent-hooks";
import { useAgentTool } from "./use-agent-tool";

export function useAgentState<S>(
  name: string,
  options?: {
    description?: string;
    writeSchema?: ZodSchema<S>;
    intialValue?: S | (() => S);
  },
): [S, Dispatch<SetStateAction<S>>] {
  if (options?.writeSchema instanceof ZodSchema) {
    return useAgentWritable(name, options.writeSchema, options.intialValue) as [S, Dispatch<SetStateAction<S>>];
  } else {
    return useAgentReadable(name, options?.intialValue) as [S, Dispatch<SetStateAction<S>>];
  }
}

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

export function useAgentWritable<S>(
  name: string,
  schema: ZodSchema<S>,
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>];
export function useAgentWritable<S>(
  name: string,
  schema: ZodSchema<S>,
): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
export function useAgentWritable(name: string, schema: ZodSchema<any>, initialState?: any) {
  const readable = useAgentWritable(name, initialState);
  useAgentTool(`set ${name}`, { params: schema, run: readable[1] });

  return readable;
}
