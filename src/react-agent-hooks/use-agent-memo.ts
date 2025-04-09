import { useEffect, useState } from "react";
import { implicitRootAgentContext } from "./agent-hooks";

export function useAgentMemo<T>(
  name: string,
  options: { description?: string; factory: () => T; dependencies?: unknown[] },
): T {
  const [latestValue, setLatestValue] = useState<T>(options.factory());

  useEffect(
    () => {
      const newValue = options.factory();
      implicitRootAgentContext.set(name, { type: "state", data: newValue });
      setLatestValue(newValue);
      return () => void implicitRootAgentContext.delete(name);
    },
    options.dependencies ? [name, options.factory, ...options.dependencies] : (undefined as any),
  );

  return latestValue;
}
