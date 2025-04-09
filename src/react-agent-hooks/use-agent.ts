import OpenAI from "openai";
import { stringify } from "yaml";
import { ZodSchema } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import type { AgentToolItem } from "./agent-context";
import { implicitRootAgentContext } from "./agent-context";

export function useAgent(options: { apiKey: string }) {
  const openai = new OpenAI({ dangerouslyAllowBrowser: true, apiKey: options.apiKey });

  const printStates = () => {
    const printItems: any[] = [];
    implicitRootAgentContext.forEach((value, key) => {
      switch (value.type) {
        case "state":
          printItems.push([key, value.data]);
          break;
      }
    });

    return stringify(Object.fromEntries(printItems));
  };

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
${printStates()}
\`\`\`

Based on user's instruction or goals, you can either answer user's question based on app state, or use on of the provided tools to update the state.
          `.trim(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        tools: [...implicitRootAgentContext.entries()]
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
${printStates()}
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

  return {
    run,
    abort,
  };
}

function zodParseJSON<T>(schema: ZodSchema<T>) {
  return (input: string): T => schema.parse(JSON.parse(input));
}
