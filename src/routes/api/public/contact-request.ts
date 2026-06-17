import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const Body = z.object({
  visitor_name: z.string().trim().min(2).max(120),
  visitor_email: z.string().trim().email().max(255),
  visitor_phone: z.string().trim().min(5).max(40),
  reason: z.string().trim().min(5).max(2000),
  applicant_type: z.enum(["service_provider", "apprentice", "youth"]),
  applicant_id: z.string().uuid(),
  category: z.string().trim().max(80).optional().nullable(),
});

export const Route = createFileRoute("/api/public/contact-request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try {
          const json = await request.json();
          parsed = Body.parse(json);
        } catch (e) {
          return Response.json(
            { error: e instanceof Error ? e.message : "Invalid request" },
            { status: 400 },
          );
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Verify applicant exists, is published, not suspended/archived
        const tables = {
          service_provider: "service_providers",
          apprentice: "apprentices",
          youth: "youth_profiles",
        } as const;
        const table = tables[parsed.applicant_type];
        const { data: applicant, error: fetchErr } = await supabaseAdmin
          .from(table)
          .select("id, full_name, email, is_published, is_suspended, is_archived")
          .eq("id", parsed.applicant_id)
          .maybeSingle();
        if (fetchErr || !applicant) {
          return Response.json({ error: "Applicant not found" }, { status: 404 });
        }
        if (!applicant.is_published || applicant.is_suspended || applicant.is_archived) {
          return Response.json(
            { error: "This profile is not currently accepting contact requests." },
            { status: 403 },
          );
        }

        const { data: row, error: insertErr } = await supabaseAdmin
          .from("contact_requests")
          .insert({
            applicant_type: parsed.applicant_type,
            applicant_id: parsed.applicant_id,
            service_provider_id:
              parsed.applicant_type === "service_provider" ? parsed.applicant_id : null,
            requester_name: parsed.visitor_name,
            requester_email: parsed.visitor_email,
            requester_contact: parsed.visitor_phone,
            visitor_phone: parsed.visitor_phone,
            reason: parsed.reason,
            message: parsed.reason,
            category: parsed.category ?? null,
            status: "contact_shared",
            disclaimer_accepted_at: new Date().toISOString(),
            terms_accepted_at: new Date().toISOString(),
            terms_version_accepted: "v1",
          })
          .select("id")
          .single();

        if (insertErr || !row) {
          return Response.json({ error: insertErr?.message ?? "Could not save request." }, { status: 500 });
        }

        // Schedule a 30-day feedback request
        const scheduled = new Date();
        scheduled.setDate(scheduled.getDate() + 30);
        await supabaseAdmin.from("feedback_requests").insert({
          contact_request_id: row.id,
          applicant_type: parsed.applicant_type,
          applicant_id: parsed.applicant_id,
          visitor_email: parsed.visitor_email,
          scheduled_for: scheduled.toISOString(),
        });

        // NOTE: actual outbound email sending requires a configured email
        // domain. The contact request is stored; an admin can reach out
        // manually, or wire Lovable Emails to auto-send when the domain
        // is set up.

        return Response.json({ ok: true, id: row.id });
      },
      OPTIONS: async () => new Response(null, { status: 204 }),
    },
  },
});
