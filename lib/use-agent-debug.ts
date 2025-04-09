import { implicitRootAgentContext } from "./agent-context";

export function useAgentDebug() {
  const dump = () => {
    return Object.fromEntries(implicitRootAgentContext.entries());
  };

  return {
    dump,
  };
}
