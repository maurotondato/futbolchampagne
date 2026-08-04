/** Arma un link de wa.me. Si hay teléfono, va directo a ese contacto (AR: 549 + área + número). */
export function whatsappLink(text: string, phone?: string | null) {
  const encoded = encodeURIComponent(text);
  const digits = phone?.replace(/\D/g, "");
  if (digits && digits.length >= 8) {
    return `https://wa.me/549${digits}?text=${encoded}`;
  }
  return `https://wa.me/?text=${encoded}`;
}
