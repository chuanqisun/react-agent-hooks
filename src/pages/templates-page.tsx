import { z } from "zod";
import data from "../data/main.json";
import { useAgentState, useAgentTool } from "../react-agent-hooks/agent-hooks";

export function TemplatesPage() {
  // useAgentMemo("agent-templates", () => data.agentTemplates, [data.agentTemplates]);
  const [agentTemplates, setAgentTemplates] = useAgentState("agent-templates", data.agentTemplates);

  const allowedTags = data.agentTemplates.flatMap((template) => template.tags);

  useAgentTool("filter-agent-by-tag", z.object({ tag: z.enum(allowedTags as any) }), (args) => {
    const filteredTemplates = data.agentTemplates.filter((template) => template.tags.includes(args.tag));
    setAgentTemplates(filteredTemplates);
  });

  return agentTemplates.map((template: any) => (
    <div key={template.id} className="template">
      <h2>{template.name}</h2>
      <p>{template.description}</p>
      <pre>{JSON.stringify(template, null, 2)}</pre>
    </div>
  ));
}
