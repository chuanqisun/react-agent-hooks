import OpenAI from "openai";
import { useEffect, useState } from "react";
import { stringify } from "yaml";

export type AgentStateItem = AgentResourceItem | AgentToolItem;
export interface AgentResourceItem {
  type: "resource";
  data: any;
}
export interface AgentToolItem {
  type: "tool";
  params: any;
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

  const run = (prompt: string) =>
    openai.beta.chat.completions.runTools({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: ``.trim(),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      tools: [],
    });

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
