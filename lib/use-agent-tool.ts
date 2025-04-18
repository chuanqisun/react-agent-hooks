import { useContext, useEffect, useId } from "react";
import { z, ZodObject, type ZodSchema } from "zod";
import { AgentContextInternal, implicitRootAgentContext } from "./agent-context";
import { getPathPrefix } from "./get-path-prefix";

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
  const prefix = getPathPrefix(context.breadcrumbs);
  const id = useId();

  useEffect(() => {
    if (options?.enabled === false) return void implicitRootAgentContext.delete(id);

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

    implicitRootAgentContext.set(id, {
      name,
      prefix,
      type: "tool",
      params: openaiCompatRunner.params,
      callback: openaiCompatRunner.run,
      description: options?.description,
      context,
    });

    return () => void implicitRootAgentContext.delete(id);
  }, [id, prefix, name, params, run, options?.enabled, ...(options?.dependencies ?? [])]);

  return run;
}
