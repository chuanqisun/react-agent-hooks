import { useEffect } from "react";
import { ZodSchema } from "zod";
import { implicitRootAgentContext } from "./agent-hooks";

export function useAgentTool<T, K>(
  name: string,
  params: ZodSchema<T>,
  run: (params: T) => K | Promise<K>,
  options?: { description?: string; dependencies?: unknown[] },
) {
  useEffect(() => {
    implicitRootAgentContext.set(name, { type: "tool", params, callback: run });
    return () => void implicitRootAgentContext.delete(name);
  }, [name, params, run, ...(options?.dependencies ?? [])]);

  return run;
}
