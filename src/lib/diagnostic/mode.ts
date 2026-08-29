import type { DiagnosticMode } from '@/types/diagnostic'

/**
 * Resolve o modo de diagnóstico a partir do parâmetro `mode` da URL de
 * `/diagnostico` (SPEC — Escolha do tipo de diagnóstico, §2). Qualquer valor
 * diferente de "quick" (ausente, inválido, ou "complete") inicia o modo
 * completo — o comportamento já existente antes desta escolha.
 */
export function resolveDiagnosticMode(raw: string | string[] | undefined): DiagnosticMode {
  const value = Array.isArray(raw) ? raw[0] : raw
  return value === 'quick' ? 'quick' : 'complete'
}
