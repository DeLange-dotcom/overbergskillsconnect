import { redirect } from "@tanstack/react-router";
import { isEnabled, type Feature } from "./features";

export function requireFeature(feature: Feature) {
  if (!isEnabled(feature)) {
    throw redirect({
      to: "/unavailable",
      search: { feature } as never,
    });
  }
}
