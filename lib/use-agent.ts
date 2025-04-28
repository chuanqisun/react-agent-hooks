import OpenAI, { APIUserAbortError } from "openai";
import type { FunctionToolCallArgumentsDoneEvent } from "openai/lib/ChatCompletionStream.mjs";
import type { ChatModel } from "openai/resources.mjs";
import { useRef, useState } from "react";
import { useAgentContext } from "./use-agent-context";

export type AgentStatus = "idle" | "started" | "tool-use" | "chat";

export function useAgent(options: { apiKey: string }) {
  const agentOptions = options;
  const openai = new OpenAI({ dangerouslyAllowBrowser: true, apiKey: agentOptions.apiKey });
  const agentContext = useAgentContext();
  const activeControllers = useRef<AbortController[]>([]);
  const [status, setStatus] = useState<AgentStatus>("idle");

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
      /**
       * Invoked when LLM has used a tool
       */
      onToolUsed?: (toolUseEvent: FunctionToolCallArgumentsDoneEvent) => void;
      /**
       * Invoked as the last step of agent.
       * Agent will either summarize any action performed
       * or chat to the user if no action can be performed
       */
      onChatResponse?: (text: string) => void;
    },
  ) => {
    const abortController = new AbortController();
    activeControllers.current.push(abortController);

    let isFinished = false;
    let previousToolMessages: any[] = [];
    let endTask: (finalResponse: string) => void | undefined;

    const talkToUserTool = {
      type: "function" as const,
      function: {
        name: "talk_to_user",
        description: "Summarize your action or chat to user",
        parse: JSON.parse,
        function: async (args: any) => {
          const { utterance } = args;
          isFinished = true;
          endTask?.(utterance);
        },
        parameters: {
          type: "object",
          properties: {
            utterance: {
              type: "string",
              description: "One sentence response to user",
            },
          },
          required: ["utterance"],
        },
      },
    };

    const initialState = agentContext.stringifyStates();

    try {
      setStatus("started");

      while (!abortController.signal.aborted && !isFinished) {
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
${initialState}
\`\`\`

Based on user's instruction or goals, either answer user's question based on app state, or use one of the provided tools to update the state.
In the end, you must use the special "talk_to_user" tool to provide a short verbal answer/confirmation to the user.
          `.trim(),
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            tools: [talkToUserTool, ...agentContext.getTools()],
            parallel_tool_calls: !!options?.enableParallelToolCalls,
            tool_choice: "required",
          },
          {
            signal: options?.signal,
          },
        );

        task.on("tool_calls.function.arguments.delta", (args) => {
          if (args.name === "talk_to_user") {
            console.log("[chat]", args);
            setStatus("chat");
          }
        });

        task.on("tool_calls.function.arguments.done", (args) => {
          const isGeneratingChat = args.name === "talk_to_user";
          if (!isGeneratingChat) {
            console.log("[tool-use]", args);
            setStatus("tool-use");
            options?.onToolUsed?.(args);
          }
        });

        endTask = (finalContent: string) => {
          options?.onChatResponse?.(finalContent);
          task.abort();
        };

        await task.done();

        const toolMessages = task.messages.filter((m) => m.role === "tool" || m.role === "assistant");
        previousToolMessages = [...previousToolMessages, ...toolMessages];
      }
    } catch (error) {
      if (error instanceof APIUserAbortError) return; // abort is expected
      throw error;
    } finally {
      setStatus("idle");
      activeControllers.current = activeControllers.current.filter((controller) => controller !== abortController);
    }
  };

  return {
    run,
    status,
  };
}
