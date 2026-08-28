import type { DiagnosticResult } from '@/lib/ai/schema'

export const RESULT_STORAGE_KEY = 'diagnostico:result'

export type StoredDiagnosticResult = {
  result: DiagnosticResult
  whatsapp: string
}

/**
 * O resultado fica apenas em sessionStorage (client-side, temporário): o
 * backend não persiste nada (SPEC.md §26, §30).
 */
export function loadDiagnosticResult(): StoredDiagnosticResult | null {
  try {
    const raw = sessionStorage.getItem(RESULT_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredDiagnosticResult
  } catch {
    return null
  }
}

export function clearDiagnosticResult(): void {
  sessionStorage.removeItem(RESULT_STORAGE_KEY)
}
