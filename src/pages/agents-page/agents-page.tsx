import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { NavLink } from "react-router";
import { z } from "zod";
import { useAgentMemo, useAgentTool } from "../../react-agent-hooks/use-agent";
import { listMyAgents } from "./get-agents";

export function AgentsPage() {
  const query = useQuery({ queryKey: ["my-agents"], queryFn: listMyAgents });

  const [sortBy, setSortBy] = useQueryState("sort-by", { defaultValue: "name" });

  useAgentMemo("sort-by", () => sortBy, [sortBy]);

  const displayItems = useAgentMemo(
    "my-agents",
    () => {
      if (!query.data) return [];

      return query.data.slice().sort((a, b) => {
        const field = sortBy as keyof typeof a;
        const valueA = a[field];
        const valueB = b[field];

        if (typeof valueA === "string" && typeof valueB === "string") {
          return valueA.localeCompare(valueB);
        }

        return String(valueA).localeCompare(String(valueB));
      });
    },
    [query.data],
  );

  useAgentTool("sort-my-agents", z.object({ sortBy: z.enum(["name", "description", "model"]) }), (args) =>
    setSortBy(args.sortBy),
  );

  return (
    <table className="agents-table">
      <thead>
        <tr>
          <th>
            <button onClick={() => setSortBy("name")}> Name </button>
          </th>
          <th>
            <button onClick={() => setSortBy("description")}> Description </button>
          </th>
          <th>
            <button onClick={() => setSortBy("model")}> Model </button>
          </th>
        </tr>
      </thead>
      <tbody>
        {displayItems?.map((agent) => (
          <tr key={agent.id} className="agent">
            <td>
              <NavLink to={`/agents/${agent.id}/build`}>{agent.name}</NavLink>
            </td>
            <td>{agent.description}</td>
            <td>{agent.model}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
