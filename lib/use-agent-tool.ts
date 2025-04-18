import { useContext, useEffect } from "react";
import { z, ZodObject, type ZodSchema } from "zod";
import { AgentContextInternal, implicitRootAgentContext } from "./agent-context";

export function useAgentTool<T, K>(
  name: string,
  params: ZodSchema<T>,
  run: (params: T) => K | Promise<K>,
  options?: {
    /** Describe additional guidance about this tool that is not described in the parameter schema itself  */
    description?: string;
    /** When dependencies are not provided, the effect will run on every render. */
    dependencies?: unknown[];
    /** Explicitly show/hide the state from the agent */
    enabled?: boolean;
  },
) {
  const context = useContext(AgentContextInternal);

  useEffect(
    () => {
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
        description: options?.description,
        context,
      });

      return () => void implicitRootAgentContext.delete(name);
    },
    options?.dependencies ? [name, params, run, ...(options.dependencies ?? []), options?.enabled] : undefined,
  );

  return run;
}
