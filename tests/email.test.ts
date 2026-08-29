import { describe, expect, it } from 'vitest'
import { buildDiagnosticEmail, buildDiagnosticEmailSubject } from '@/lib/email/template'
import { makeValidAreaInterview, makeValidComplementaryInterview, makeValidRequest, makeValidQuickRequest } from './fixtures'

describe('buildDiagnosticEmailSubject', () => {
  it('inclui o nome da empresa no assunto', () => {
    const subject = buildDiagnosticEmailSubject(makeValidRequest())
    expect(subject).toContain('Padaria Bom Pão')
  })

  it('identifica o modo completo no assunto', () => {
    const subject = buildDiagnosticEmailSubject(makeValidRequest({ diagnosticMode: 'complete' }))
    expect(subject).toBe('[Diagnóstico Completo] Nova resposta — Padaria Bom Pão')
  })

  it('identifica o modo rápido no assunto', () => {
    const subject = buildDiagnosticEmailSubject(makeValidQuickRequest())
    expect(subject).toBe('[Diagnóstico Rápido] Nova resposta — Padaria Bom Pão')
  })
})

describe('buildDiagnosticEmail', () => {
  it('inclui todas as seções esperadas no corpo do e-mail', () => {
    const { text } = buildDiagnosticEmail(makeValidRequest())
    expect(text).toContain('NOVO DIAGNÓSTICO DE OPORTUNIDADES COM IA')
    expect(text).toContain('EMPRESA')
    expect(text).toContain('RESPONSÁVEL')
    expect(text).toContain('ÁREA PRIORITÁRIA')
    expect(text).toContain('DADOS E SEGURANÇA')
    expect(text).toContain('FIM DO DIAGNÓSTICO')
  })

  it('inclui as respostas da empresa e do contato', () => {
    const { text } = buildDiagnosticEmail(makeValidRequest())
    expect(text).toContain('Padaria Bom Pão')
    expect(text).toContain('Maria Silva')
    expect(text).toContain('11999998888')
  })

  it('mostra "(não informado)" para blocos deixados em branco, sem inventar conteúdo', () => {
    const request = makeValidRequest({
      interviews: [makeValidAreaInterview({ weeklyRepetitiveTasks: '', monthlyRepetitiveTasks: '' })],
    })
    const { text } = buildDiagnosticEmail(request)
    expect(text).toContain('Tarefas semanais: (não informado)')
    expect(text).toContain('Tarefas mensais: (não informado)')
  })

  it('inclui uma seção por área, na ordem ÁREA PRIORITÁRIA / COMPLEMENTAR 1 / COMPLEMENTAR 2', () => {
    const request = makeValidRequest({
      interviews: [makeValidAreaInterview({ area: 'Financeiro' }), makeValidComplementaryInterview('Comercial', 'RAPIDA')],
    })
    const { text } = buildDiagnosticEmail(request)
    expect(text).toContain('ÁREA PRIORITÁRIA')
    expect(text).toContain('ÁREA COMPLEMENTAR 1')
    expect(text.indexOf('ÁREA PRIORITÁRIA')).toBeLessThan(text.indexOf('ÁREA COMPLEMENTAR 1'))
  })

  it('mostra o rótulo "Nível" com a profundidade de cada área', () => {
    const request = makeValidRequest({
      interviews: [makeValidAreaInterview({ area: 'Financeiro' }), makeValidComplementaryInterview('Comercial', 'RAPIDA')],
    })
    const { text } = buildDiagnosticEmail(request)
    expect(text).toContain('Nível: APROFUNDADA')
    expect(text).toContain('Nível: RÁPIDA')
  })

  it('não avalia dados e segurança para uma área rápida (bloco O é exclusivo do modo aprofundado)', () => {
    const request = makeValidRequest({
      interviews: [makeValidAreaInterview({ area: 'Financeiro' }), makeValidComplementaryInterview('Comercial', 'RAPIDA')],
    })
    const { text } = buildDiagnosticEmail(request)
    const priorityAreaSection = text.split('ÁREA PRIORITÁRIA')[1].split('ÁREA COMPLEMENTAR 1')[0]
    const complementaryAreaSection = text.split('ÁREA COMPLEMENTAR 1')[1]
    expect(priorityAreaSection).toContain('DADOS E SEGURANÇA')
    expect(complementaryAreaSection).not.toContain('DADOS E SEGURANÇA')
  })

  it('inclui o dimensionamento quantitativo quando informado', () => {
    const request = makeValidRequest({
      interviews: [
        makeValidAreaInterview({
          quantitativeSizing: {
            sourceField: 'mostTimeConsumingTask',
            taskLabel: 'Lançar notas fiscais',
            peopleCount: 3,
            executionFrequency: 'diariamente',
            minutesPerExecution: 20,
            monthlyExecutions: 40,
          },
        }),
      ],
    })
    const { text } = buildDiagnosticEmail(request)
    expect(text).toContain('Horas/mês estimadas: 40')
  })

  it('informa que nenhuma tarefa foi escolhida para dimensionar quando o campo é opcional e fica vazio', () => {
    const { text } = buildDiagnosticEmail(makeValidRequest())
    expect(text).toContain('(nenhuma tarefa foi escolhida para dimensionar)')
  })

  it('identifica o DIAGNÓSTICO COMPLETO em um banner no topo do e-mail', () => {
    const { text } = buildDiagnosticEmail(makeValidRequest({ diagnosticMode: 'complete' }))
    expect(text.trim().startsWith('================================\nDIAGNÓSTICO COMPLETO')).toBe(true)
  })

  it('identifica o DIAGNÓSTICO RÁPIDO em um banner no topo do e-mail', () => {
    const { text } = buildDiagnosticEmail(makeValidQuickRequest())
    expect(text.trim().startsWith('================================\nDIAGNÓSTICO RÁPIDO')).toBe(true)
  })
})
