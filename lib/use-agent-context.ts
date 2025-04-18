import { stringify } from "yaml";
import zodToJsonSchema from "zod-to-json-schema";
import { implicitRootAgentContext, type AgentItem, type AgentToolItem } from "./agent-context";
import { getToolName } from "./get-tool-name";
import { zodParseJSON } from "./zod-parse-json";

/**
 * Use this hook to build your own agent
 * It returns an array of tools that are compatible with OpenAI's tool use API
 */
export function useAgentContext() {
  const getStates = () => {
    // sort by the prefix so the tools for the same UI area will be grouped together
    const groupedByPrefix = Object.entries(
      Object.groupBy(implicitRootAgentContext.values(), (item) => item.prefix) as Record<string, AgentItem[]>,
    );

    const view = groupedByPrefix.map(([prefix, items]) => {
      return [
        ["root", prefix].filter(Boolean).join("::"),
        Object.fromEntries(
          items.map((value) => {
            switch (value.type) {
              case "state": {
                return [`【state】${value.name}${value.description ? ` (${value.description})` : ""}`, value.data];
              }
              case "tool": {
                return [
                  `【tool】${value.name}${value.description ? ` (${value.description})` : ""}`,
                  getToolName(value.name),
                ];
              }
            }
          }),
        ),
      ];
    });

    return Object.fromEntries(view);
  };

  const stringifyStates = () => {
    return stringify(getStates()).trim();
  };

  const getTools = () =>
    [...implicitRootAgentContext.entries()]
      .filter(([_k, value]) => value.type === "tool")
      .map(([_key, item]) => ({
        type: "function" as const,
        function: {
          name: getToolName(item.name),
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
