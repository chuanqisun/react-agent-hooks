import { implicitRootAgentContext } from "./agent-hooks";

export function useAgentDebug() {
  const dump = () => {
    return Object.fromEntries(implicitRootAgentContext.entries());
  };

  return {
    dump,
  };
}
