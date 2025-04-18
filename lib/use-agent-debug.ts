import { useAgentContext } from "./use-agent-context";

export function useAgentDebug() {
  const context = useAgentContext();
  const debugObject = () => context.getStates();
  const debugText = () => {
    return context.stringifyStates();
  };

  return {
    debugText,
    debugObject,
  };
}
