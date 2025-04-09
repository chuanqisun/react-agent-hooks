import { useEffect, useState } from "react";
import { implicitRootAgentContext } from "./agent-hooks";

export function useAgentMemo<T>(
  name: string,
  factory: () => T,
  dependencies: unknown[],
  _options?: { description?: string },
): T {
  const [latestValue, setLatestValue] = useState<T>(factory());

  useEffect(() => {
    const newValue = factory();
    implicitRootAgentContext.set(name, { type: "state", data: newValue });
    setLatestValue(newValue);
    return () => void implicitRootAgentContext.delete(name);
  }, dependencies);

  return latestValue;
}
