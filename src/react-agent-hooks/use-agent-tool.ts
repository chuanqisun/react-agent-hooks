import { useEffect } from "react";
import { ZodSchema } from "zod";
import { implicitRootAgentContext } from "./agent-hooks";

export function useAgentTool<T, K>(
  name: string,
  options: { description?: string; params: ZodSchema<T>; run: (params: T) => K | Promise<K> },
) {
  useEffect(() => {
    implicitRootAgentContext.set(name, { type: "tool", params: options.params, callback: options.run });
    return () => void implicitRootAgentContext.delete(name);
  }, [name, options.params, options.run]);

  return options.run;
}
