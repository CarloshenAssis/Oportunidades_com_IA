import { describe, expect, it } from 'vitest'
import { extractDimensioningCandidates } from '@/lib/diagnostic/dimensioning'
import { createEmptyAreaInterview } from '@/lib/validation/diagnostic'
import { makeValidAreaInterview } from './fixtures'

describe('extractDimensioningCandidates (SPEC V3 §7 — escolha manual, sem candidata automática)', () => {
  it('lista tarefas candidatas a partir das respostas preenchidas', () => {
    const interview = makeValidAreaInterview()
    const candidates = extractDimensioningCandidates(interview)
    expect(candidates.length).toBeGreaterThan(0)
    expect(candidates.every((c) => c.label.length > 0)).toBe(true)
  })

  it('não gera candidatas quando a área está totalmente em branco', () => {
    const interview = createEmptyAreaInterview('Financeiro', 'PRIORITARIA', 'APROFUNDADA')
    expect(extractDimensioningCandidates(interview)).toHaveLength(0)
  })

  it('ignora respostas negativas explícitas como "não temos"', () => {
    const interview = makeValidAreaInterview({ reworkTasks: 'não temos', errorProcesses: 'Não' })
    const candidates = extractDimensioningCandidates(interview)
    expect(candidates.find((c) => c.sourceField === 'reworkTasks')).toBeUndefined()
    expect(candidates.find((c) => c.sourceField === 'errorProcesses')).toBeUndefined()
  })

  it('só inclui uma tarefa com porta de entrada quando o gate correspondente é "Sim"', () => {
    const interview = makeValidAreaInterview({ hasDocuments: 'Não', documentTypes: 'Notas fiscais recebidas por e-mail.' })
    const candidates = extractDimensioningCandidates(interview)
    expect(candidates.find((c) => c.sourceField === 'documentTypes')).toBeUndefined()
  })

  it('não duplica candidatas quando duas respostas descrevem a mesma tarefa', () => {
    const interview = makeValidAreaInterview({
      mostTimeConsumingTask: 'Lançar notas fiscais recebidas por e-mail no sistema financeiro.',
      taskToEliminate: 'Lançar notas fiscais recebidas por e-mail no sistema financeiro.',
    })
    const candidates = extractDimensioningCandidates(interview)
    const labels = candidates.map((c) => c.label)
    expect(new Set(labels).size).toBe(labels.length)
  })
})
