import { whatsappHref } from "./phone";

export function approvedContactMessage(providerName: string, providerPhone: string) {
  return (
    `Good news: ${providerName} accepted your contact request on Overberg Skills Connect.\n\n` +
    `Their WhatsApp/contact number is: ${providerPhone}`
  );
}

export function declinedContactMessage(providerName: string) {
  return (
    `${providerName} declined your contact request on Overberg Skills Connect.\n\n` +
    "You can browse other listings on the noticeboard."
  );
}

export function openWhatsAppMessage(phone: string, message: string, targetWindow?: Window | null) {
  const href = whatsappHref(phone, message);
  if (targetWindow && !targetWindow.closed) {
    targetWindow.opener = null;
    targetWindow.location.href = href;
    return;
  }
  window.open(href, "_blank", "noopener,noreferrer");
}
