import type { AgentItem } from "./agent-context";

export class ReactiveContext extends EventTarget {
  private rawContext: Map<string, AgentItem>;

  constructor(options: { rawContext: Map<string, AgentItem> }) {
    super();
    this.rawContext = options.rawContext;
  }

  get(key: string) {
    return this.rawContext.get(key);
  }

  set(key: string, value: AgentItem) {
    const existingItem = this.rawContext.get(key);
    if (existingItem && existingItem === value) return;

    this.rawContext.set(key, value);
    this.dispatchEvent(new CustomEvent("change", { detail: { key, value } }));
  }

  delete(key: string) {
    if (!this.rawContext.has(key)) return;

    this.rawContext.delete(key);
    this.dispatchEvent(new CustomEvent("change", { detail: { key } }));
  }

  values() {
    return this.rawContext.values();
  }

  raw() {
    return this.rawContext;
  }
}
