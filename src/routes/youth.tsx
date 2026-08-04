import { Outlet, createFileRoute } from "@tanstack/react-router";
import { requireFeature } from "@/lib/disabled-route";

export const Route = createFileRoute("/youth")({
  beforeLoad: () => requireFeature("youthHub"),
  component: YouthLayout,
});

function YouthLayout() {
  return <Outlet />;
}
