import { RATE_LIMIT } from '@/lib/config/limits'

/**
 * Rate limiting simples em memória (SPEC.md §31). Funciona por instância do
 * processo: em ambientes serverless com múltiplas instâncias (ex.: Vercel sob
 * carga) o limite é aplicado por instância, não globalmente. Para um limite
 * global e persistente entre instâncias, substituir por uma solução externa
 * (ex.: Upstash Redis) mantendo a mesma assinatura de `checkRateLimit`.
 */
const hits = new Map<string, { count: number; windowStart: number }>()

export function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now - entry.windowStart > RATE_LIMIT.windowMs) {
    hits.set(key, { count: 1, windowStart: now })
    return true
  }

  if (entry.count >= RATE_LIMIT.maxRequests) {
    return false
  }

  entry.count += 1
  return true
}
