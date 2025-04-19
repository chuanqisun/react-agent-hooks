import { stringify } from "yaml";
import zodToJsonSchema from "zod-to-json-schema";
import { implicitRootAgentContext, type AgentItem, type AgentToolItem } from "./agent-context";
import { zodParseJSON } from "./zod-parse-json";

/**
 * Use this hook to build your own agent
 * It returns an array of tools that are compatible with OpenAI's tool use API
 */
export function useAgentContext() {
  const getStates = () => {
    const compiledContext = compileContext(implicitRootAgentContext);
    const view = compiledContext.map(([prefix, items]) => {
      return [
        ["root", prefix].filter(Boolean).join("::"),
        Object.fromEntries(
          items.map((value) => {
            switch (value.type) {
              case "state": {
                return [`【state】${value.name}${value.description ? ` (${value.description})` : ""}`, value.data];
              }
              case "tool": {
                const toolName = getToolName(value.name);
                const isRenamed = value.name !== toolName;
                const fullDescription =
                  isRenamed && value.description
                    ? `${value.name} (${value.description})`
                    : value.description
                      ? value.description
                      : value.name;
                return [`【tool】${toolName}`, fullDescription];
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

  const getTools = () => {
    const compiledContext = compileContext(implicitRootAgentContext);
    return compiledContext.flatMap(([_prefix, items]) => {
      return items
        .filter((item) => item.type === "tool")
        .map((item) => {
          return {
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
          };
        });
    });
  };

  return {
    getStates,
    getTools,
    stringifyStates,
  };
}

/** OpenAI require this format: ^[a-zA-Z0-9_-]+$ */
function getToolName(displayName: string) {
  return displayName.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function compileContext(implicitRootAgentContext: Map<string, AgentItem>) {
  const grouped = groupByPrefix(implicitRootAgentContext);
  return aliasToolNames(grouped);
}

/**
 * Group and sort by the prefix so the tools for the same UI area will be grouped together
 */
function groupByPrefix(implicitRootAgentContext: Map<string, AgentItem>) {
  const grouped = Object.entries(
    Object.groupBy(implicitRootAgentContext.values(), (item) => item.prefix) as Record<string, AgentItem[]>,
  ).sort(([prefixA], [prefixB]) => prefixA.localeCompare(prefixB));
  return grouped;
}

/**
 * Because user can use the same tool name, we append suffix number (first use has no suffix, second use has 2 as suffix)
 */
function aliasToolNames(grouped: [prefix: string, item: AgentItem[]][]) {
  const toolNames = new Map<string, number>();
  return grouped.map(([prefix, items]) => {
    return [
      prefix,
      items.map((item) => {
        if (item.type === "tool") {
          const name = item.name;
          const count = toolNames.get(name) ?? 0;
          toolNames.set(name, count + 1);
          item.name = count === 0 ? name : `${name}${count}`;
        }
        return item;
      }),
    ] as const;
  });
}
