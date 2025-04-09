import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { NavLink } from "react-router";
import { z } from "zod";
import { useAgentMemo, useAgentTool } from "../../react-agent-hooks";
import { listMyAgents } from "./get-agents";

export function AgentsPage() {
  const query = useQuery({ queryKey: ["my-agents"], queryFn: listMyAgents });

  const [sortBy, setSortBy] = useQueryState("sort-by", { defaultValue: "name" });
  const [sortDir, setSortDir] = useQueryState("sort-dir", { defaultValue: "asc" });
  const [filterValue, setFilterValue] = useQueryState("filter-value", { defaultValue: "" });

  useAgentMemo("sort-by", () => sortBy, [sortBy]);
  useAgentMemo("filter-value", () => filterValue, [filterValue]);

  useAgentTool("set-filter-value", z.string(), (args) => {
    setFilterValue(args);
  });

  const displayItems = useAgentMemo(
    "my-agents",
    () => {
      if (!query.data) return [];

      let result = query.data.slice();

      // Apply filtering if filter value exists
      if (filterValue) {
        const lowerFilter = filterValue.toLowerCase();
        result = result.filter(
          (agent) =>
            agent.name.toLowerCase().includes(lowerFilter) ||
            agent.description.toLowerCase().includes(lowerFilter) ||
            agent.model.toLowerCase().includes(lowerFilter),
        );
      }

      // Apply sorting
      result.sort((a, b) => {
        const field = sortBy as keyof typeof a;
        const valueA = a[field];
        const valueB = b[field];

        if (typeof valueA === "string" && typeof valueB === "string") {
          return valueA.localeCompare(valueB);
        }

        return String(valueA).localeCompare(String(valueB));
      });

      if (sortDir === "desc") result.reverse();
      return result;
    },
    [query.data, sortBy, sortDir, filterValue],
  );

  const handleClickTableHeader = (header: string) => {
    setSortBy(header);
    if (sortBy === header) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    }
  };

  useAgentTool(
    "sort-my-agents",
    z.object({ sortBy: z.enum(["name", "description", "model"]), direction: z.enum(["asc", "desc"]) }),
    (args) => {
      setSortBy(args.sortBy);
      setSortDir(args.direction);
    },
  );

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(event.target.value);
  };

  return (
    <div>
      <input type="search" value={filterValue} onChange={handleFilterChange} placeholder="Filter agents..." />
      <table className="agents-table">
        <thead>
          <tr>
            <th>
              <button onClick={() => handleClickTableHeader("name")}> Name </button>
            </th>
            <th>
              <button onClick={() => handleClickTableHeader("description")}> Description </button>
            </th>
            <th>
              <button onClick={() => handleClickTableHeader("model")}> Model </button>
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
    </div>
  );
}
