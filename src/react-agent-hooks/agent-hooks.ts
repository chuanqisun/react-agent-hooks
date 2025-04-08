import { createContext } from "react";
import { ZodSchema } from "zod";

export type AgentItem = AgentStateItem | AgentToolItem;
export interface AgentStateItem {
  type: "state";
  data: any;
}
export interface AgentToolItem {
  type: "tool";
  params: ZodSchema<any>;
  callback: (args: any) => any;
}

export interface ExplicitAgentContext {
  breadcrumbs: string[]; // top-down, including self
}

export const AgentContext = createContext;

export const implicitRootAgentContext = new Map<string, AgentItem>();
