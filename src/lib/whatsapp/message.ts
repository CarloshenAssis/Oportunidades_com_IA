/**
 * Normaliza um número de telefone para dígitos, assumindo DDI 55 (Brasil)
 * quando o usuário não informa o código do país.
 */
export function normalizePhoneToDigits(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, '')

  if (digits.length === 0) {
    return ''
  }

  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits
  }

  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`
  }

  return digits
}

export function isValidPhoneDigits(digits: string): boolean {
  return digits.length >= 12 && digits.length <= 13
}

export const WHATSAPP_MESSAGE =
  'Olá! Acabei de preencher o Diagnóstico de Oportunidades com IA e gostaria de conversar sobre a minha empresa.'

/** Gera um link wa.me com a mensagem pré-preenchida do diagnóstico. */
export function buildWhatsAppUrl(rawPhone: string): string {
  const digits = normalizePhoneToDigits(rawPhone)
  const text = encodeURIComponent(WHATSAPP_MESSAGE)
  return `https://wa.me/${digits}?text=${text}`
}
