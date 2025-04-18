import { useContext, useEffect, useMemo } from "react";
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

  const normalizedName = useMemo(() => normalizeToolName(name), [name]);

  useEffect(
    () => {
      if (options?.enabled === false) return void implicitRootAgentContext.delete(normalizedName);

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

      implicitRootAgentContext.set(normalizedName, {
        type: "tool",
        params: openaiCompatRunner.params,
        callback: openaiCompatRunner.run,
        description: options?.description,
        context,
      });

      return () => void implicitRootAgentContext.delete(normalizedName);
    },
    options?.dependencies
      ? [normalizedName, params, run, ...(options.dependencies ?? []), options?.enabled]
      : undefined,
  );

  return run;
}

/** OpenAI require this format: ^[a-zA-Z0-9_-]+$ */
function normalizeToolName(name: string) {
  return name.replace(/[^a-zA-Z0-9_-]/g, "_");
}
