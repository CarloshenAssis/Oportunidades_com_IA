import type { AreaInterview } from '@/types/diagnostic'
import { isFollowUpWorthy } from './normalize'

export type DimensioningCandidate = {
  sourceField: string
  label: string
}

type CandidateSource = {
  field: keyof AreaInterview
  label: string
  gate?: keyof AreaInterview
  gateValue?: string
}

/**
 * Tarefas mencionadas ao longo da entrevista que podem ser dimensionadas
 * quantitativamente. O usuário escolhe qual delas quer aprofundar — o sistema
 * não escolhe automaticamente (SPEC V3 §7).
 */
const CANDIDATE_SOURCES: CandidateSource[] = [
  { field: 'mostTimeConsumingTask', label: 'Tarefa que mais consome tempo' },
  { field: 'taskToEliminate', label: 'Tarefa a eliminar ou simplificar' },
  { field: 'mainTasks', label: 'Principais tarefas da área' },
  { field: 'reworkTasks', label: 'Tarefas que precisam ser refeitas' },
  { field: 'errorProcesses', label: 'Processos com erros frequentes' },
  { field: 'documentTypes', label: 'Processamento de documentos', gate: 'hasDocuments', gateValue: 'Sim' },
  { field: 'writingContent', label: 'Escrita repetitiva', gate: 'hasRepeatedWriting', gateValue: 'Sim' },
  { field: 'searchWhat', label: 'Busca de informações', gate: 'hasInformationSearch', gateValue: 'Sim' },
]

/** Extrai, sem duplicar, as tarefas mencionadas nas respostas que podem ser dimensionadas. */
export function extractDimensioningCandidates(interview: Partial<AreaInterview>): DimensioningCandidate[] {
  const seen = new Set<string>()
  const candidates: DimensioningCandidate[] = []

  for (const source of CANDIDATE_SOURCES) {
    if (source.gate && interview[source.gate] !== source.gateValue) continue

    const value = interview[source.field]
    if (typeof value !== 'string' || !isFollowUpWorthy(value)) continue

    const trimmed = value.trim()
    if (seen.has(trimmed)) continue
    seen.add(trimmed)

    candidates.push({ sourceField: source.field, label: trimmed })
  }

  return candidates
}
