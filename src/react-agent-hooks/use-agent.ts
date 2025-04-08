import OpenAI from "openai";
import {} from "openai/helpers/zod";
import { useEffect, useState } from "react";
import { stringify } from "yaml";
import { ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";

export type AgentStateItem = AgentResourceItem | AgentToolItem;
export interface AgentResourceItem {
  type: "resource";
  data: any;
}
export interface AgentToolItem {
  type: "tool";
  params: ZodSchema<any>;
  callback: (args: any) => any;
}

export const agentState = new Map<string, AgentStateItem>();

export function useAgentResource(name: string, initialValue: any) {
  const [state, setState] = useState<any>(initialValue);

  useEffect(() => {
    agentState.set(name, { type: "resource", data: state });
    return () => void agentState.delete(name);
  }, [name, state]);

  return [state, setState];
}

export function useAgentTool(name: string, params: any, callback: (args: any) => any) {
  useEffect(() => {
    agentState.set(name, { type: "tool", params, callback });
    return () => void agentState.delete(name);
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
${debugResources()}
\`\`\`

Based on user's instruction or goals, you can either answer user's question based on app state, or use on of the provided tools to update the state.
          `.trim(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        tools: [...agentState.entries()]
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
${debugResources()}
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

  const debugResources = () => {
    const printItems: any[] = [];
    agentState.forEach((value, key) => {
      switch (value.type) {
        case "resource":
          printItems.push([key, value.data]);
          break;
      }
    });

    return stringify(Object.fromEntries(printItems));
  };

  const debugTools = () => {
    const printItems: any[] = [];
    agentState.forEach((value, key) => {
      switch (value.type) {
        case "tool":
          printItems.push([key, "<zod>"]);
          break;
      }
    });

    return stringify(Object.fromEntries(printItems));
  };

  const debug = () => {
    return `
Resources
${debugResources()}

Tools
${debugTools()}
    `.trim();
  };

  return {
    run,
    abort,
    debug,
  };
}

function zodParseJSON<T>(schema: ZodSchema<T>) {
  return (input: string): T => schema.parse(JSON.parse(input));
}
