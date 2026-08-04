import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendWhatsApp } from "./whatsapp.server";

function originFromRequest(request: Request) {
  return new URL(request.url).origin;
}

function firstName(name: string | null | undefined) {
  return (name || "there").trim().split(/\s+/)[0] || "there";
}

async function getUserIdFromBearer(request: Request) {
  const token = request.headers
    .get("Authorization")
    ?.replace(/^Bearer\s+/i, "")
    .trim();
  if (!token) return null;

  const supabaseUrl = process.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !publishableKey) return null;

  const client = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error) return null;
  return data.user?.id ?? null;
}

export async function requireUserId(request: Request) {
  const userId = await getUserIdFromBearer(request);
  if (!userId) {
    return { error: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId };
}

export async function sendAdvertWelcome(request: Request, listingId: string, userId: string) {
  const { data: listing, error } = await supabaseAdmin
    .from("noticeboard_profiles")
    .select("id, user_id, name, phone, public_listing_reference")
    .eq("id", listingId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !listing) {
    return Response.json({ error: "Listing not found" }, { status: 404 });
  }

  const origin = originFromRequest(request);
  const publicRef = listing.public_listing_reference || listing.id;
  const result = await sendWhatsApp({
    to: listing.phone,
    body:
      `Hi ${firstName(listing.name)}, welcome to Overberg Skills Connect. ` +
      `Your skill advert is live.\n\n` +
      `View your listing: ${origin}/profile/${publicRef}\n` +
      `Manage requests: ${origin}/my-advert`,
  });

  return Response.json({ ok: result.ok, whatsapp: result });
}

export async function sendServiceProviderWelcome(
  request: Request,
  providerId: string,
  applicationCode: string,
) {
  const { data: provider, error } = await supabaseAdmin
    .from("service_providers")
    .select("id, full_name, mobile_number, whatsapp_number, application_code")
    .eq("id", providerId)
    .eq("application_code", applicationCode)
    .maybeSingle();

  if (error || !provider) {
    return Response.json({ error: "Provider registration not found" }, { status: 404 });
  }

  const origin = originFromRequest(request);
  const result = await sendWhatsApp({
    to: provider.whatsapp_number || provider.mobile_number,
    body:
      `Hi ${firstName(provider.full_name)}, welcome to Overberg Skills Connect. ` +
      `We received your registration. Your reference is ${provider.application_code}.\n\n` +
      `A coordinator will review your details. Visit: ${origin}`,
  });

  return Response.json({ ok: result.ok, whatsapp: result });
}

export async function sendProviderContactRequest(
  request: Request,
  requestId: string,
  userId: string,
) {
  const { data: contactRequest, error } = await supabaseAdmin
    .from("noticeboard_contact_requests")
    .select("id, requester_name, requester_contact, message, requester_user_id, status, profile_id")
    .eq("id", requestId)
    .eq("requester_user_id", userId)
    .maybeSingle();

  if (error || !contactRequest) {
    return Response.json({ error: "Contact request not found" }, { status: 404 });
  }
  if (contactRequest.status !== "pending") {
    return Response.json({ ok: true, skipped: "not_pending" });
  }

  const { data: profile } = await supabaseAdmin
    .from("noticeboard_profiles")
    .select("name, phone, manage_token")
    .eq("id", contactRequest.profile_id)
    .maybeSingle();

  if (!profile) {
    return Response.json({ error: "Advert not found" }, { status: 404 });
  }

  const origin = originFromRequest(request);
  const accept = `${origin}/api/noticeboard/decision?token=${profile.manage_token}&request=${contactRequest.id}&decision=approved`;
  const decline = `${origin}/api/noticeboard/decision?token=${profile.manage_token}&request=${contactRequest.id}&decision=declined`;
  const message = contactRequest.message ? `\n\nMessage: ${contactRequest.message}` : "";

  const result = await sendWhatsApp({
    to: profile.phone,
    body:
      `Hi ${firstName(profile.name)}, ${contactRequest.requester_name} would like your contact details via Overberg Skills Connect.` +
      `${message}\n\n` +
      `Approve: ${accept}\n` +
      `Decline: ${decline}`,
  });

  return Response.json({ ok: result.ok, whatsapp: result });
}

export async function sendRequesterDecision(request: Request, requestId: string) {
  const { data: contactRequest, error } = await supabaseAdmin
    .from("noticeboard_contact_requests")
    .select("id, requester_contact, status, requester_token, profile_id")
    .eq("id", requestId)
    .maybeSingle();

  if (error || !contactRequest) {
    return Response.json({ error: "Contact request not found" }, { status: 404 });
  }

  const { data: profile } = await supabaseAdmin
    .from("noticeboard_profiles")
    .select("name, phone")
    .eq("id", contactRequest.profile_id)
    .maybeSingle();

  if (!profile) {
    return Response.json({ error: "Advert not found" }, { status: 404 });
  }

  const origin = originFromRequest(request);
  const body =
    contactRequest.status === "approved"
      ? `Good news: ${profile.name} accepted your contact request on Overberg Skills Connect.\n\nWhatsApp/contact: ${profile.phone}\nView: ${origin}/request/${contactRequest.requester_token}`
      : `${profile.name} declined your contact request on Overberg Skills Connect. You can browse other listings here: ${origin}/find-help`;

  const result = await sendWhatsApp({ to: contactRequest.requester_contact, body });
  return Response.json({ ok: result.ok, whatsapp: result });
}
