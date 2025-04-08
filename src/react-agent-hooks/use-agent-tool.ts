import { useEffect } from "react";
import { ZodSchema } from "zod";
import { implicitRootAgentContext } from "./agent-hooks";

export function useAgentTool(name: string, params: ZodSchema<any>, callback: (params: any) => any) {
  useEffect(() => {
    implicitRootAgentContext.set(name, { type: "tool", params, callback });
    return () => void implicitRootAgentContext.delete(name);
  }, [name, params, callback]);

  return callback;
}
