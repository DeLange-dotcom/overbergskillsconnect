import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireFeature } from "@/lib/disabled-route";

export const Route = createFileRoute("/apprenticeships")({
  beforeLoad: () => requireFeature("apprenticeships"),
  component: () => <Outlet />,
});
