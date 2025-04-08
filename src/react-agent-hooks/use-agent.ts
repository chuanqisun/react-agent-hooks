import OpenAI from "openai";
import {} from "openai/helpers/zod";
import { useEffect, useMemo, useState } from "react";
import { stringify } from "yaml";
import { ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export type AgentItem = AgentStateItem | AgentToolItem;
export interface AgentStateItem {
  type: "state";
  data: any;
}
export interface AgentToolItem {
  type: "tool";
  params: ZodSchema<any>;
  callback: (args: any) => any;
}

export const agentItemMap = new Map<string, AgentItem>();

export function useAgentMemo<T>(name: string, transform: () => T, deps: any[]) {
  useEffect(() => {
    agentItemMap.set(name, { type: "state", data: transform() });
    return () => void agentItemMap.delete(name);
  }, [name, transform]);

  return useMemo(() => {
    const newValue = transform();
    agentItemMap.set(name, { type: "state", data: transform() });
    return newValue;
  }, [name, transform, ...deps]);
}

export function useAgentState(name: string, initialValue: any) {
  const [state, setState] = useState<any>(initialValue);

  useEffect(() => {
    agentItemMap.set(name, { type: "state", data: state });
    return () => void agentItemMap.delete(name);
  }, [name, state]);

  return [state, setState];
}

export function useAgentTool(name: string, params: any, callback: (args: any) => any) {
  useEffect(() => {
    agentItemMap.set(name, { type: "tool", params, callback });
    return () => void agentItemMap.delete(name);
  }, [name, params, callback]);
}

export function useAgent(options: { apiKey: string }) {
  const openai = new OpenAI({ dangerouslyAllowBrowser: true, apiKey: options.apiKey });

  const run = async (prompt: string) => {
    const task = openai.beta.chat.completions
      .runTools({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `
User is interacting with a web app in the following state:
\`\`\`yaml
${debugStates()}
\`\`\`

Based on user's instruction or goals, you can either answer user's question based on app state, or use on of the provided tools to update the state.
          `.trim(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        tools: [...agentItemMap.entries()]
          .filter(([_k, value]) => value.type === "tool")
          .map(([name, item]) => ({
            type: "function",
            function: {
              name,
              parse: zodParseJSON((item as AgentToolItem).params),
              function: async (args: any) => {
                try {
                  await (item as AgentToolItem).callback(args);
                  await new Promise((resolve) => setTimeout(resolve, 10));

                  return `
Updated state:
\`\`\`yaml
${debugStates()}
\`\`\`
              `.trim();
                } catch (e: any) {
                  return `Error: ${[e?.name, e?.message].filter(Boolean).join(" ")}`;
                }
              },
              parameters: zodToJsonSchema((item as AgentToolItem).params),
            } as any,
          })),
      })
      .on("message", (message) => console.log(message));

    const finalContent = await task.finalContent();
    console.log("Final content:", finalContent);
  };

  const abort = () => {};

  const debugStates = () => {
    const printItems: any[] = [];
    agentItemMap.forEach((value, key) => {
      switch (value.type) {
        case "state":
          printItems.push([key, value.data]);
          break;
      }
    });

    return stringify(Object.fromEntries(printItems));
  };

  const debugTools = () => {
    const printItems: any[] = [];
    agentItemMap.forEach((value, key) => {
      switch (value.type) {
        case "tool":
          printItems.push([key, "<zod>"]);
          break;
      }
    });

    return stringify(Object.fromEntries(printItems));
  };

  const dump = () => {
    return Object.fromEntries(agentItemMap.entries());
  };

  const debug = () => {
    return `
States
${debugStates()}

Tools
${debugTools()}
    `.trim();
  };

  return {
    run,
    abort,
    debug,
    dump,
  };
}

function zodParseJSON<T>(schema: ZodSchema<T>) {
  return (input: string): T => schema.parse(JSON.parse(input));
}
