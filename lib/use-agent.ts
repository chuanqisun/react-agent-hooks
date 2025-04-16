import OpenAI from "openai";
import { useAgentContext } from "./use-agent-context";

export function useAgent(options: { apiKey: string }) {
  const openai = new OpenAI({ dangerouslyAllowBrowser: true, apiKey: options.apiKey });
  const agentContext = useAgentContext();

  const run = async (prompt: string) => {
    const task = openai.beta.chat.completions
      .runTools({
        stream: true,
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: `
User is interacting with a web app in the following state:
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
      })
      .on("message", (message) => console.log(message));

    return task;
  };

  const abort = () => {};

  return {
    run,
    abort,
  };
}
