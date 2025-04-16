import { useContext, useEffect } from "react";
import { z, ZodObject, type ZodSchema } from "zod";
import { AgentContextInternal, implicitRootAgentContext } from "./agent-context";

export function useAgentTool<T, K>(
  name: string,
  params: ZodSchema<T>,
  run: (params: T) => K | Promise<K>,
  options?: {
    description?: string;
    dependencies?: unknown[];
    enabled?: boolean;
  },
) {
  const context = useContext(AgentContextInternal);

  useEffect(() => {
    if (options?.enabled === false) return void implicitRootAgentContext.delete(name);

    // if params is zod.Object, use as is, otherwise wrap in as { input: params }
    const openaiCompatRunner =
      params instanceof ZodObject
        ? {
            params: params,
            run: run,
          }
        : {
            params: z.object({ input: params }),
            run: (args: any) => run(args.input),
          };

    implicitRootAgentContext.set(name, {
      type: "tool",
      params: openaiCompatRunner.params,
      callback: openaiCompatRunner.run,
      context,
    });

    return () => void implicitRootAgentContext.delete(name);
  }, [name, params, run, ...(options?.dependencies ?? []), options?.enabled]);

  return run;
}
