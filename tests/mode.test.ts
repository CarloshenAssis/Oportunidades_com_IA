import { describe, expect, it } from 'vitest'
import { resolveDiagnosticMode } from '@/lib/diagnostic/mode'

describe('resolveDiagnosticMode (SPEC — Escolha do tipo de diagnóstico, §2)', () => {
  it('clicar em "Começar diagnóstico rápido" (mode=quick) inicia o modo quick', () => {
    expect(resolveDiagnosticMode('quick')).toBe('quick')
  })

  it('clicar em "Começar diagnóstico completo" (mode=complete) inicia o modo complete', () => {
    expect(resolveDiagnosticMode('complete')).toBe('complete')
  })

  it('acessar /diagnostico sem parâmetro de modo mantém o comportamento existente (completo)', () => {
    expect(resolveDiagnosticMode(undefined)).toBe('complete')
  })

  it('um valor inválido de mode nunca inicia o modo rápido por engano', () => {
    expect(resolveDiagnosticMode('xyz')).toBe('complete')
  })

  it('usa o primeiro valor quando o parâmetro é repetido na URL', () => {
    expect(resolveDiagnosticMode(['quick', 'complete'])).toBe('quick')
  })
})
