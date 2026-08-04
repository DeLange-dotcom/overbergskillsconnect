import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendRequesterDecision } from "@/lib/noticeboard-whatsapp.server";
import { requireUserId } from "@/lib/noticeboard-whatsapp.server";

export const Route = createFileRoute("/api/noticeboard/decision-notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const requestId = typeof body?.request_id === "string" ? body.request_id : "";
        const manageToken = typeof body?.manage_token === "string" ? body.manage_token : "";
        if (!requestId) {
          return Response.json({ error: "request_id is required" }, { status: 400 });
        }

        const { data: row } = await supabaseAdmin
          .from("noticeboard_contact_requests")
          .select("profile_id, noticeboard_profiles!inner(user_id, manage_token)")
          .eq("id", requestId)
          .maybeSingle();

        if (!row) {
          return Response.json({ error: "Contact request not found" }, { status: 404 });
        }

        const profile = Array.isArray(row.noticeboard_profiles)
          ? row.noticeboard_profiles[0]
          : row.noticeboard_profiles;
        const ownerUserId = profile?.user_id ?? null;
        const ownerManageToken = profile?.manage_token ?? null;

        if (manageToken) {
          if (manageToken !== ownerManageToken) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
          }
        } else {
          const auth = await requireUserId(request);
          if ("error" in auth) return auth.error;
          if (auth.userId !== ownerUserId) {
            return Response.json({ error: "Forbidden" }, { status: 403 });
          }
        }

        return sendRequesterDecision(request, requestId);
      },
    },
  },
});
