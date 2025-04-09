import { NavLink, useNavigate } from "react-router";
import { z } from "zod";
import { useAgentTool } from "../../react-agent-hooks";

export function AppNav() {
  const routes: { to: string; name: string }[] = [
    { to: "/templates", name: "Templates" },
    { to: "/agents", name: "Agents" },
    { to: "/workflows", name: "Workflows" },
    { to: "/builder", name: "Builder" },
  ];

  const navigate = useNavigate();

  useAgentTool("navigate", z.object({ to: z.enum(routes.map((r) => r.to) as any) }), (args) => {
    navigate(args.to);
  });

  return (
    <div className="c-nav">
      <NavLink to="/templates">Templates</NavLink>
      <NavLink to="/agents">Agents</NavLink>
      <NavLink to="/workflows">Workflows</NavLink>
    </div>
  );
}
