import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendRequesterDecision } from "@/lib/noticeboard-whatsapp.server";

export const Route = createFileRoute("/api/noticeboard/decision")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const token = url.searchParams.get("token") ?? "";
        const requestId = url.searchParams.get("request") ?? "";
        const decision = url.searchParams.get("decision") ?? "";

        if (!token || !requestId || !["approved", "declined"].includes(decision)) {
          return html("Invalid request", "This approval link is not valid.", 400);
        }

        const { data: profile } = await supabaseAdmin
          .from("noticeboard_profiles")
          .select("id")
          .eq("manage_token", token)
          .maybeSingle();

        if (!profile) {
          return html("Invalid link", "This approval link is no longer valid.", 404);
        }

        const { data: updated, error } = await supabaseAdmin
          .from("noticeboard_contact_requests")
          .update({ status: decision, decided_at: new Date().toISOString() })
          .eq("id", requestId)
          .eq("profile_id", profile.id)
          .eq("status", "pending")
          .select("id")
          .maybeSingle();

        if (error) {
          return html("Could not update request", error.message, 500);
        }

        if (updated) {
          await sendRequesterDecision(request, requestId);
        }

        const title = decision === "approved" ? "Request approved" : "Request declined";
        const detail =
          decision === "approved"
            ? "The requester has been sent your contact details by WhatsApp."
            : "The requester has been told that the request was declined.";

        return html(title, detail, 200, `/my-listing/${token}`);
      },
    },
  },
});

function html(title: string, detail: string, status = 200, managePath?: string) {
  const link = managePath
    ? `<p><a href="${managePath}">Back to my listing</a></p>`
    : `<p><a href="/">Back to Overberg Skills Connect</a></p>`;
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><style>body{font-family:system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem;color:#1f2937}a{color:#1b5e20}</style></head><body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(detail)}</p>${link}</body></html>`,
    { status, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => {
    const escapes: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return escapes[ch];
  });
}
