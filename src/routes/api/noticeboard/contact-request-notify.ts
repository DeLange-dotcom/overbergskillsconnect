import { createFileRoute } from "@tanstack/react-router";
import { requireUserId, sendProviderContactRequest } from "@/lib/noticeboard-whatsapp.server";

export const Route = createFileRoute("/api/noticeboard/contact-request-notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireUserId(request);
        if ("error" in auth) return auth.error;

        const body = await request.json().catch(() => null);
        const requestId = typeof body?.request_id === "string" ? body.request_id : "";
        if (!requestId) {
          return Response.json({ error: "request_id is required" }, { status: 400 });
        }

        return sendProviderContactRequest(request, requestId, auth.userId);
      },
    },
  },
});
