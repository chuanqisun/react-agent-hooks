import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router";
import "./index.css";
import { AppLayout } from "./pages/_app-layout";
import { AgentsPage } from "./pages/agents-page/agents-page";
import { PlaceholderPage } from "./pages/placeholder-page";
import { TemplatesPage } from "./pages/templates-page";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate replace to="/templates" />,
      },
      {
        path: "/templates",
        element: <TemplatesPage />,
      },
      {
        path: "/agents",
        element: <AgentsPage />,
      },
      {
        path: "/agents/:agentId",
        element: <RedirectToAgentBuild />,
      },
      {
        path: "/agents/:agentId/build",
        element: <PlaceholderPage />,
      },
      {
        path: "/workflows",
        element: <PlaceholderPage />,
      },
    ],
  },
]);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);

function RedirectToAgentBuild() {
  const params = useParams();
  return <Navigate replace to={`/agents/${params.agentId}/build`} />;
}
