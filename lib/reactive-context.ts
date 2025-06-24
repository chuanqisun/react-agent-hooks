import { debounceTime, distinctUntilChanged, map, Subject } from "rxjs";
import zodToJsonSchema from "zod-to-json-schema";
import type { AgentItem } from "./agent-context";

export class ReactiveContext extends EventTarget {
  private rawContext: Map<string, AgentItem>;
  private change$ = new Subject<Map<string, AgentItem>>();

  constructor(options: { rawContext: Map<string, AgentItem> }) {
    super();
    this.rawContext = options.rawContext;

    this.change$.pipe(debounceTime(100), map(toKey), distinctUntilChanged()).subscribe(() => {
      this.dispatchEvent(new Event("change"));
    });
  }

  get(key: string) {
    return this.rawContext.get(key);
  }

  set(key: string, value: AgentItem) {
    const existingItem = this.rawContext.get(key);
    if (existingItem && existingItem === value) return;

    this.rawContext.set(key, value);
    this.change$.next(this.rawContext);
  }

  delete(key: string) {
    if (!this.rawContext.has(key)) return;

    this.rawContext.delete(key);
    this.change$.next(this.rawContext);
  }

  values() {
    return this.rawContext.values();
  }

  raw() {
    return this.rawContext;
  }
}

function toKey(rawContext: Map<string, AgentItem>) {
  return Array.from(rawContext.entries())
    .map(([key, item]) => {
      if (item.type === "state") {
        return JSON.stringify([key, item.data]);
      } else if (item.type === "tool") {
        const serializableSchema = zodToJsonSchema(item.params);
        return JSON.stringify([key, item.name, item.description, item.context, serializableSchema]);
      } else {
        throw new Error(`Unknown item type: ${item}`);
      }
    })
    .join(",");
}
