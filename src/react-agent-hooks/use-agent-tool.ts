import { useEffect } from "react";
import { ZodSchema } from "zod";
import { implicitRootAgentContext } from "./agent-hooks";

export function useAgentTool<T, K>(name: string, params: ZodSchema<T>, callback: (params: T) => K) {
  useEffect(() => {
    implicitRootAgentContext.set(name, { type: "tool", params, callback });
    return () => void implicitRootAgentContext.delete(name);
  }, [name, params, callback]);

  return callback;
}
