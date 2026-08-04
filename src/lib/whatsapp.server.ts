import { normalizeSouthAfricanPhone } from "./phone";

type SendWhatsAppArgs = {
  to: string | null | undefined;
  body: string;
};

type SendWhatsAppResult =
  | { ok: true; skipped?: false }
  | { ok: true; skipped: true; reason: string }
  | { ok: false; error: string };

function env(name: string) {
  return process.env[name]?.trim() || "";
}

function twilioConfigured() {
  return Boolean(
    env("TWILIO_ACCOUNT_SID") && env("TWILIO_AUTH_TOKEN") && env("TWILIO_WHATSAPP_FROM"),
  );
}

function metaConfigured() {
  return Boolean(env("WHATSAPP_PHONE_NUMBER_ID") && env("WHATSAPP_ACCESS_TOKEN"));
}

export function whatsappConfigured() {
  return twilioConfigured() || metaConfigured();
}

export async function sendWhatsApp({ to, body }: SendWhatsAppArgs): Promise<SendWhatsAppResult> {
  const normalized = normalizeSouthAfricanPhone(to);
  if (!normalized) return { ok: true, skipped: true, reason: "missing_phone" };

  if (twilioConfigured()) {
    return sendViaTwilio(normalized, body);
  }

  if (metaConfigured()) {
    return sendViaMeta(normalized, body);
  }

  console.warn("[WhatsApp] No provider configured; message skipped.");
  return { ok: true, skipped: true, reason: "not_configured" };
}

async function sendViaTwilio(toDigits: string, body: string): Promise<SendWhatsAppResult> {
  const sid = env("TWILIO_ACCOUNT_SID");
  const token = env("TWILIO_AUTH_TOKEN");
  const from = env("TWILIO_WHATSAPP_FROM");
  const auth = Buffer.from(`${sid}:${token}`).toString("base64");

  const payload = new URLSearchParams({
    From: from.startsWith("whatsapp:") ? from : `whatsapp:${from}`,
    To: `whatsapp:+${toDigits}`,
    Body: body,
  });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: `Twilio WhatsApp failed: ${res.status} ${text.slice(0, 500)}` };
  }

  return { ok: true };
}

async function sendViaMeta(toDigits: string, body: string): Promise<SendWhatsAppResult> {
  const phoneNumberId = env("WHATSAPP_PHONE_NUMBER_ID");
  const token = env("WHATSAPP_ACCESS_TOKEN");

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: toDigits,
      type: "text",
      text: { preview_url: true, body },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: `Meta WhatsApp failed: ${res.status} ${text.slice(0, 500)}` };
  }

  return { ok: true };
}
