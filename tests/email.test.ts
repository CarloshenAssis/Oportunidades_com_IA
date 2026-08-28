import { describe, expect, it } from 'vitest'
import { buildDiagnosticEmail, buildDiagnosticEmailSubject } from '@/lib/email/template'
import { makeValidAreaInterview, makeValidRequest } from './fixtures'

describe('buildDiagnosticEmailSubject', () => {
  it('inclui o nome da empresa no assunto', () => {
    const subject = buildDiagnosticEmailSubject(makeValidRequest())
    expect(subject).toBe('Novo Diagnóstico de IA — Padaria Bom Pão')
  })
})

describe('buildDiagnosticEmail', () => {
  it('inclui todas as seções esperadas no corpo do e-mail', () => {
    const { text } = buildDiagnosticEmail(makeValidRequest())
    expect(text).toContain('NOVO DIAGNÓSTICO DE OPORTUNIDADES COM IA')
    expect(text).toContain('EMPRESA')
    expect(text).toContain('ÁREAS PRIORITÁRIAS')
    expect(text).toContain('ÁREA 1 — FINANCEIRO')
    expect(text).toContain('DADOS E SEGURANÇA')
    expect(text).toContain('CONTATO')
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
    expect(text).toContain('Tarefas semanais:\n(não informado)')
    expect(text).toContain('Tarefas mensais:\n(não informado)')
  })

  it('inclui uma seção por área, na mesma ordem das entrevistas', () => {
    const request = makeValidRequest({
      areas: ['Financeiro', 'Comercial'],
      priorityAreas: [
        { area: 'Financeiro', reason: 'x' },
        { area: 'Comercial', reason: 'y' },
      ],
      interviews: [makeValidAreaInterview({ area: 'Financeiro' }), makeValidAreaInterview({ area: 'Comercial' })],
    })
    const { text } = buildDiagnosticEmail(request)
    expect(text).toContain('ÁREA 1 — FINANCEIRO')
    expect(text).toContain('ÁREA 2 — COMERCIAL')
    expect(text.indexOf('ÁREA 1')).toBeLessThan(text.indexOf('ÁREA 2'))
  })

  it('inclui o dimensionamento quantitativo quando informado', () => {
    const request = makeValidRequest({
      interviews: [
        makeValidAreaInterview({
          quantitativeSizing: {
            sourceField: 'copyPasteTasks',
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
})
