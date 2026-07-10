import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/my-requests")({
  beforeLoad: () => {
    throw redirect({ to: "/profile" });
  },
});
