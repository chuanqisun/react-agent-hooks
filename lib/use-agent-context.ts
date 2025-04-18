import { useContext } from "react";
import { stringify } from "yaml";
import zodToJsonSchema from "zod-to-json-schema";
import { AgentContextInternal, implicitRootAgentContext, type AgentToolItem } from "./agent-context";
import { zodParseJSON } from "./zod-parse-json";

/**
 * Use this context to build your own agent
 *
 * It returns an array of tools that are compatible with OpenAI's tool use API
 */
export function useAgentContext() {
  const context = useContext(AgentContextInternal);
  if (!context) {
    throw new Error("useAgentContext must be used within an AgentContext");
  }

  const getStates = () => {
    const printItems: any[] = [];
    implicitRootAgentContext.forEach((value, key) => {
      switch (value.type) {
        case "state":
          const description = value.description?.trim();
          printItems.push([`${key}${description ? ` (${description})` : ""}`, value.data]);
          break;
      }
    });

    return Object.fromEntries(printItems);
  };

  const stringifyStates = () => {
    return stringify(getStates());
  };

  const getTools = () =>
    [...implicitRootAgentContext.entries()]
      .filter(([_k, value]) => value.type === "tool")
      .map(([name, item]) => ({
        type: "function" as const,
        function: {
          name,
          description: (item as AgentToolItem).description,
          parse: zodParseJSON((item as AgentToolItem).params),
          function: async (args: any) => {
            try {
              await (item as AgentToolItem).callback(args);
              await new Promise((resolve) => setTimeout(resolve, 10)); // digest react rendering

              return `
Updated state:
\`\`\`yaml
${stringify(getStates())}
\`\`\`
              `.trim();
            } catch (e: any) {
              return `Error: ${[e?.name, e?.message].filter(Boolean).join(" ")}`;
            }
          },
          parameters: zodToJsonSchema((item as AgentToolItem).params),
        } as any,
      }));

  return {
    getStates,
    getTools,
    stringifyStates,
  };
}
