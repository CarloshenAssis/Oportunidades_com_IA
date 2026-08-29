import { MAX_AREAS, type AreaDepth, type AreaRole } from '@/types/diagnostic'

/** Uma área decidida ao longo da entrevista, na ordem em que foi escolhida (SPEC V3 §4). */
export type AreaPlan = {
  area: string
  role: AreaRole
  depth: AreaDepth
}

/** O que perguntar depois que a entrevista da área mais recente termina (SPEC V3 §4). */
export type NextInterviewStep = 'ask-second' | 'ask-third' | 'contact'

/**
 * Decide a próxima etapa depois que uma entrevista de área é concluída.
 * Área 1 concluída → pergunta pela segunda. Área 2 concluída → pergunta pela terceira.
 * Área 3 concluída (ou já no máximo) → segue para contato.
 */
export function nextStepAfterAreaInterview(areaPlans: AreaPlan[]): NextInterviewStep {
  if (areaPlans.length <= 1) return 'ask-second'
  if (areaPlans.length === 2) return 'ask-third'
  return 'contact'
}

/**
 * Decide a próxima etapa depois que o usuário responde "quer analisar mais uma área?".
 * Recusar pula direto para o contato — a terceira área nunca é oferecida se a segunda foi recusada.
 */
export function nextStepAfterAreaDecision(wantsMore: boolean): 'select-area' | 'contact' {
  return wantsMore ? 'select-area' : 'contact'
}

/** Áreas ainda disponíveis para escolha — nunca repete uma área já usada (SPEC V3 §10). */
export function availableAreasFor(allAreas: string[], areaPlans: AreaPlan[]): string[] {
  const chosen = new Set(areaPlans.map((plan) => plan.area))
  return allAreas.filter((area) => !chosen.has(area))
}

/**
 * Adiciona uma área ao plano. A primeira é sempre prioritária e aprofundada,
 * independentemente do parâmetro `depth` (SPEC V3 §4).
 */
export function addAreaPlan(areaPlans: AreaPlan[], area: string, depth: AreaDepth = 'APROFUNDADA'): AreaPlan[] {
  const role: AreaRole = areaPlans.length === 0 ? 'PRIORITARIA' : 'COMPLEMENTAR'
  const finalDepth: AreaDepth = role === 'PRIORITARIA' ? 'APROFUNDADA' : depth
  return [...areaPlans, { area, role, depth: finalDepth }]
}

export function canAddMoreAreas(areaPlans: AreaPlan[]): boolean {
  return areaPlans.length < MAX_AREAS
}

const ORDINAL_LABELS = ['primeira', 'segunda', 'terceira'] as const

/** Rótulo amigável para a próxima área a ser adicionada ("segunda área", "terceira área"). */
export function nextAreaOrdinalLabel(areaPlans: AreaPlan[]): string {
  return ORDINAL_LABELS[Math.min(areaPlans.length, ORDINAL_LABELS.length - 1)]
}
