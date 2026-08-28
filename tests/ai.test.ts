import { describe, expect, it } from 'vitest'
import { parseAIOutput, AIAnalysisError } from '@/lib/ai/analyze'
import { MAX_OPPORTUNITIES } from '@/lib/config/limits'
import { makeValidAIResult } from './fixtures'

describe('parseAIOutput (módulo de IA dormente, preparado para reativação futura)', () => {
  it('aceita um JSON válido que segue o schema', () => {
    const result = parseAIOutput(JSON.stringify(makeValidAIResult()))
    expect(result.executiveSummary).toBeTruthy()
    expect(result.opportunities).toHaveLength(1)
  })

  it('rejeita um JSON malformado', () => {
    expect(() => parseAIOutput('{ isso não é json')).toThrow(AIAnalysisError)
  })

  it('rejeita quando falta um campo obrigatório', () => {
    const broken = makeValidAIResult()
    // @ts-expect-error removendo campo obrigatório de propósito
    delete broken.executiveSummary
    expect(() => parseAIOutput(JSON.stringify(broken))).toThrow(AIAnalysisError)
  })

  it('rejeita quando o enum de prioridade/confiança é inválido', () => {
    const broken = makeValidAIResult({ confidence: 'URGENTE' })
    expect(() => parseAIOutput(JSON.stringify(broken))).toThrow(AIAnalysisError)
  })

  it('rejeita quando o enum de tipo de solução é inválido', () => {
    const broken = makeValidAIResult({ solutionType: 'MAGIC' })
    expect(() => parseAIOutput(JSON.stringify(broken))).toThrow(AIAnalysisError)
  })

  it('corta a lista de oportunidades para o máximo permitido quando a IA retorna mais que isso', () => {
    const base = makeValidAIResult()
    const extraOpportunities = Array.from({ length: MAX_OPPORTUNITIES + 3 }, (_, index) => ({
      ...base.opportunities[0],
      id: `op-${index}`,
      title: `Oportunidade ${index}`,
    }))
    const withTooMany = { ...base, opportunities: extraOpportunities }

    const result = parseAIOutput(JSON.stringify(withTooMany))
    expect(result.opportunities).toHaveLength(MAX_OPPORTUNITIES)
  })

  it('rejeita quando a maturidade não é um dos níveis esperados', () => {
    const broken = makeValidAIResult()
    broken.companyMaturity.level = 'Nível Desconhecido'
    expect(() => parseAIOutput(JSON.stringify(broken))).toThrow(AIAnalysisError)
  })

  it('rejeita quando top3 referencia uma oportunidade inexistente', () => {
    const broken = makeValidAIResult()
    broken.top3 = ['op-inexistente']
    expect(() => parseAIOutput(JSON.stringify(broken))).toThrow(AIAnalysisError)
  })
})
