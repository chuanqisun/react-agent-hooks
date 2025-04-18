import React, { createContext, useContext, type PropsWithChildren } from "react";
import type { ZodSchema } from "zod";

export type AgentItem = AgentStateItem | AgentToolItem;
export interface AgentStateItem {
  type: "state";
  prefix: string;
  name: string;
  data: any;
  description?: string;
  context?: ExplicitAgentContext;
}
export interface AgentToolItem {
  type: "tool";
  prefix: string;
  name: string;
  params: ZodSchema<any>;
  callback: (args: any) => any;
  description?: string;
  context?: ExplicitAgentContext;
}

export interface ExplicitAgentContext {
  breadcrumbs: string[]; // top-down, including self
}

export const AgentContextInternal = createContext<ExplicitAgentContext>({
  breadcrumbs: [] as string[],
});

export const implicitRootAgentContext = new Map<string, AgentItem>();

export type AgentContextProps = PropsWithChildren & {
  name: string;
};
export const AgentContext: React.FC<AgentContextProps> = ({ name, children }) => {
  if (!name.trim()) throw new Error("AgentContext name cannot be empty");

  const parentContext = useContext(AgentContextInternal);
  return (
    <AgentContextInternal
      value={{
        breadcrumbs: [...parentContext.breadcrumbs, name as string],
      }}
    >
      {children}
    </AgentContextInternal>
  );
};
