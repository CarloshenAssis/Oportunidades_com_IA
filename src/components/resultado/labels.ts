import type { Opportunity } from '@/lib/ai/schema'

export const SOLUTION_TYPE_LABELS: Record<Opportunity['solutionType'], string> = {
  AI: 'IA',
  AUTOMATION: 'Automação',
  AI_AND_AUTOMATION: 'IA + Automação',
}

export const PRIORITY_LABELS: Record<Opportunity['priority'], string> = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
}

export const CONFIDENCE_LABELS: Record<Opportunity['confidence'], string> = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
}

export const PRIORITY_BADGE_CLASSES: Record<Opportunity['priority'], string> = {
  HIGH: 'bg-red-50 text-red-700 border-red-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  LOW: 'bg-slate-100 text-slate-700 border-slate-200',
}
