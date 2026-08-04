import { createFileRoute } from "@tanstack/react-router";
import { requireUserId, sendAdvertWelcome } from "@/lib/noticeboard-whatsapp.server";

export const Route = createFileRoute("/api/noticeboard/welcome")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireUserId(request);
        if ("error" in auth) return auth.error;

        const body = await request.json().catch(() => null);
        const listingId = typeof body?.listing_id === "string" ? body.listing_id : "";
        if (!listingId) {
          return Response.json({ error: "listing_id is required" }, { status: 400 });
        }

        return sendAdvertWelcome(request, listingId, auth.userId);
      },
    },
  },
});
