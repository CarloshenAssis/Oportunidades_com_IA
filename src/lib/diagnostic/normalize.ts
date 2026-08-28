import type { AreaRiskAnswers, SearchTime, TransferFrequency } from '@/types/diagnostic'

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Resposta curta demais para carregar qualquer sinal (SPEC V2 §24 — nunca inventar). */
export function hasMeaningfulAnswer(text: string | undefined): boolean {
  return !!text && text.trim().length >= 3
}

/** Respostas curtas que SÓ contam como negativa quando são a resposta inteira (evita falso positivo em frases como "Não sabemos ao certo, mas..."). */
const EXACT_NEGATIVE_ANSWERS = ['nao', 'nenhum', 'nenhuma', 'n/a', 'nada']

/** Frases de negação inequívocas, também reconhecidas como prefixo de uma resposta curta. */
const NEGATIVE_PHRASES = [
  'nao temos',
  'nao tem',
  'nao existe',
  'nao ha',
  'nao acontece',
  'nao fazemos',
  'nada disso',
  'nao se aplica',
  'nao aplicavel',
]

/**
 * Heurística determinística para decidir se uma resposta aberta é uma negativa clara
 * (para pular perguntas de acompanhamento condicionais sem precisar chamar a IA — SPEC V2 §50, §59).
 */
export function isExplicitNegative(text: string | undefined): boolean {
  if (!hasMeaningfulAnswer(text)) return true
  const normalized = normalizeText(text!)
  if (EXACT_NEGATIVE_ANSWERS.includes(normalized)) return true
  return NEGATIVE_PHRASES.some((pattern) => normalized === pattern || normalized.startsWith(`${pattern} `))
}

/** Uma resposta é candidata a acompanhamento (condicional ou dimensionamento) quando tem conteúdo e não é uma negativa explícita. */
export function isFollowUpWorthy(text: string | undefined): boolean {
  return hasMeaningfulAnswer(text) && !isExplicitNegative(text)
}

const FREQUENCY_SCORES: Record<TransferFrequency, number | null> = {
  'não sei': null,
  'algumas vezes por mês': 1,
  'algumas vezes por semana': 3,
  diariamente: 4,
  'várias vezes ao dia': 5,
}

/** Converte uma frequência declarada (SPEC V2 §9) em score 0–5 para a matriz de priorização. */
export function frequencyAnswerToScore(frequency: TransferFrequency | '' | undefined): number | null {
  if (!frequency) return null
  return FREQUENCY_SCORES[frequency] ?? null
}

const SEARCH_TIME_SCORES: Record<SearchTime, number | null> = {
  'não sei': null,
  'menos de 5 minutos': 1,
  '5–15 minutos': 2,
  '15–30 minutos': 4,
  'mais de 30 minutos': 5,
}

/** Converte uma faixa de tempo declarada (SPEC V2 §12) em score 0–5. */
export function searchTimeToScore(time: SearchTime | '' | undefined): number | null {
  if (!time) return null
  return SEARCH_TIME_SCORES[time] ?? null
}

/** Converte minutos por execução em score 0–5 (mais minutos = maior score de tempo). */
export function minutesToScore(minutes: number | undefined): number | null {
  if (minutes === undefined || minutes === null || Number.isNaN(minutes)) return null
  if (minutes <= 5) return 1
  if (minutes <= 15) return 2
  if (minutes <= 30) return 3
  if (minutes <= 60) return 4
  return 5
}

export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED'

/**
 * Classifica o risco de dados de uma área (SPEC V2 §28–§29).
 * Dados pessoais, financeiros ou confidenciais → VERMELHO.
 * Dados de clientes/funcionários, ou qualquer incerteza ("Não sei") → AMARELO (postura conservadora).
 * Só é VERDE quando todas as respostas são explicitamente "Não".
 */
export function classifyRisk(risk: AreaRiskAnswers): RiskLevel {
  const values = Object.values(risk)

  if (risk.personalData === 'Sim' || risk.financialData === 'Sim' || risk.confidentialData === 'Sim') {
    return 'RED'
  }

  if (values.some((value) => value === 'Sim' || value === 'Não sei' || value === '')) {
    return 'YELLOW'
  }

  return 'GREEN'
}
