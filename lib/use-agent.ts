import OpenAI from "openai";
import type { ChatModel } from "openai/resources.mjs";
import { useRef } from "react";
import { useAgentContext } from "./use-agent-context";

export function useAgent(options: { apiKey: string }) {
  const agentOptions = options;
  const openai = new OpenAI({ dangerouslyAllowBrowser: true, apiKey: agentOptions.apiKey });
  const agentContext = useAgentContext();
  const activeControllers = useRef<AbortController[]>([]);

  const run = async (
    prompt: string,
    options?: {
      model?: ChatModel;
      signal?: AbortSignal;
      /**
       * Can model call multiple tools in parallel?
       * @default false because we want the state change to be linear
       */
      enableParallelToolCalls?: boolean;
    },
  ) => {
    const abortController = new AbortController();
    activeControllers.current.push(abortController);

    const task = openai.beta.chat.completions.runTools(
      {
        stream: true,
        model: options?.model ?? "gpt-4.1",
        messages: [
          {
            role: "system",
            content: `
User is interacting with a web app with the following states and tools:

\`\`\`yaml
${agentContext.stringifyStates()}
\`\`\`

Based on user's instruction or goals, either answer user's question based on app state, or use one of the provided tools to update the state.
Short verbal answer/confirmation in the end.
          `.trim(),
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        tools: agentContext.getTools(),
        parallel_tool_calls: !!options?.enableParallelToolCalls,
      },
      {
        signal: options?.signal,
      },
    );

    task.finalContent().finally(() => {
      activeControllers.current = activeControllers.current.filter((controller) => controller !== abortController);
    });

    return task;
  };

  return {
    run,
  };
}
