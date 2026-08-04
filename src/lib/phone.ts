export function normalizeSouthAfricanPhone(phone: string | null | undefined): string | null {
  const digits = (phone || "").replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("27") && digits.length >= 11) return digits;
  if (digits.startsWith("0") && digits.length >= 10) return `27${digits.slice(1)}`;
  if (digits.length === 9) return `27${digits}`;

  return digits;
}

export function whatsappHref(phone: string, msg?: string) {
  const digits = normalizeSouthAfricanPhone(phone) ?? "";
  const text = msg ? `?text=${encodeURIComponent(msg)}` : "";
  return `https://wa.me/${digits}${text}`;
}
