import React, { createContext, useContext, type PropsWithChildren } from "react";
import type { ZodSchema } from "zod";

export type AgentItem = AgentStateItem | AgentToolItem;
export interface AgentStateItem {
  type: "state";
  data: any;
  context?: ExplicitAgentContext;
}
export interface AgentToolItem {
  type: "tool";
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
