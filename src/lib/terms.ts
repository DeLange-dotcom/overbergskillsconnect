import { supabase } from "@/integrations/supabase/client";

export const TERMS_VERSION = "1.0";
export const TERMS_EFFECTIVE_DATE = "16 June 2026";

export const ACCEPTANCE_TEXT =
  "I confirm that I have read and understood the Terms, Privacy Notice and Disclaimer. I understand that Hineni acts only as a community connection and referral platform and does not guarantee the conduct, suitability or performance of any applicant, service provider, employer or service seeker. I accept these terms and agree to use the platform at my own risk.";

export type AcceptanceContext =
  | "provider_registration"
  | "service_request"
  | "contact_request"
  | "general";

async function fetchClientIp(): Promise<string | null> {
  try {
    const res = await fetch("https://api.ipify.org?format=json", { cache: "no-store" });
    if (!res.ok) return null;
    const j = (await res.json()) as { ip?: string };
    return j.ip ?? null;
  } catch {
    return null;
  }
}

export async function recordTermsAcceptance(params: {
  context: AcceptanceContext;
  referenceTable?: string;
  referenceId?: string;
}): Promise<void> {
  const [{ data: userData }, ip] = await Promise.all([
    supabase.auth.getUser(),
    fetchClientIp(),
  ]);
  const user_agent =
    typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null;

  await supabase.from("terms_acceptances").insert({
    user_id: userData?.user?.id ?? null,
    context: params.context,
    reference_table: params.referenceTable ?? null,
    reference_id: params.referenceId ?? null,
    acceptance_text: ACCEPTANCE_TEXT,
    terms_version: TERMS_VERSION,
    ip_address: ip,
    user_agent,
  });
}
