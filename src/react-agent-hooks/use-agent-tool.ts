import { useEffect } from "react";
import { z, ZodObject, ZodSchema } from "zod";
import { implicitRootAgentContext } from "./agent-hooks";

export function useAgentTool<T, K>(
  name: string,
  params: ZodSchema<T>,
  run: (params: T) => K | Promise<K>,
  options?: { description?: string; dependencies?: unknown[] },
) {
  useEffect(() => {
    // if params is zod.Object, use as is, otherwise wrap in as { input: params }
    const openaiCompatRunner =
      params instanceof ZodObject
        ? {
            params,
            run,
          }
        : {
            params: z.object({ input: params }),
            run: (args: any) => run(args.input),
          };

    implicitRootAgentContext.set(name, {
      type: "tool",
      params: openaiCompatRunner.params,
      callback: openaiCompatRunner.run,
    });
    return () => void implicitRootAgentContext.delete(name);
  }, [name, params, run, ...(options?.dependencies ?? [])]);

  return run;
}
