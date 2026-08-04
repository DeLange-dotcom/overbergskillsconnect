import { createFileRoute } from "@tanstack/react-router";
import { sendServiceProviderWelcome } from "@/lib/noticeboard-whatsapp.server";

export const Route = createFileRoute("/api/provider/welcome")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const providerId = typeof body?.provider_id === "string" ? body.provider_id : "";
        const applicationCode =
          typeof body?.application_code === "string" ? body.application_code : "";
        if (!providerId || !applicationCode) {
          return Response.json(
            { error: "provider_id and application_code are required" },
            { status: 400 },
          );
        }

        return sendServiceProviderWelcome(request, providerId, applicationCode);
      },
    },
  },
});
