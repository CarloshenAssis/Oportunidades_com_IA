import type { AreaInterview, DiagnosticRequest } from '@/types/diagnostic'
import { computeMonthlyCost, computeMonthlyHours } from '@/lib/diagnostic/impact'

const SEPARATOR = '================================'

function value(text: string | undefined): string {
  const trimmed = text?.trim()
  return trimmed ? trimmed : '(não informado)'
}

function list(values: string[] | undefined): string {
  return values && values.length > 0 ? values.join(', ') : '(não informado)'
}

function section(title: string, lines: Array<string | ''>): string {
  const body = lines.filter(Boolean)
  return body.length > 0 ? `${title}\n${body.join('\n')}` : `${title}\n(não informado)`
}

function formatDimensioning(interview: AreaInterview): string {
  const sizing = interview.quantitativeSizing
  if (!sizing?.taskLabel) return 'DIMENSIONAMENTO\n(nenhuma tarefa foi escolhida para dimensionar)'

  const monthlyHours = computeMonthlyHours({
    peopleCount: sizing.peopleCount,
    monthlyExecutions: sizing.monthlyExecutions ?? undefined,
    minutesPerExecution: sizing.minutesPerExecution,
  })
  const monthlyCost = computeMonthlyCost(monthlyHours, interview.hourlyCost)

  return section('DIMENSIONAMENTO', [
    `Tarefa escolhida: ${sizing.taskLabel}`,
    `Pessoas envolvidas: ${sizing.peopleCount ?? '(não informado)'}`,
    `Frequência: ${sizing.executionFrequency || '(não informado)'}`,
    `Minutos por execução: ${sizing.minutesPerExecution ?? '(não informado)'}`,
    `Execuções por mês: ${sizing.monthlyExecutions ?? '(não sei / não informado)'}`,
    sizing.executionVariation ? `Variação de volume: ${sizing.executionVariation}` : '',
    sizing.hasSeasonalPeak ? `Pico sazonal: ${sizing.hasSeasonalPeak}${sizing.seasonalPeakDescription ? ` — ${sizing.seasonalPeakDescription}` : ''}` : '',
    `Horas/mês estimadas: ${monthlyHours ?? '(dados insuficientes)'} — estimativa gerencial`,
    interview.hourlyCost ? `Custo/hora informado: ${interview.hourlyCost}` : '',
    monthlyCost !== null ? `Custo mensal estimado: ${monthlyCost} — estimativa gerencial` : '',
  ])
}

/** Corpo completo de uma área com entrevista aprofundada — blocos A a O (SPEC V3 §15). */
function formatDeepArea(interview: AreaInterview): string {
  const sections = [
    section('ROTINA', [
      `Tarefas diárias: ${value(interview.dailyRepetitiveTasks)}`,
      `Tarefas semanais: ${value(interview.weeklyRepetitiveTasks)}`,
      `Tarefas mensais: ${value(interview.monthlyRepetitiveTasks)}`,
      `Várias vezes ao dia: ${value(interview.multipleTimesPerDay)}`,
    ]),
    section('PRINCIPAL TAREFA', [
      `Principais tarefas da área: ${value(interview.mainTasks)}`,
      `Tarefa que mais consome tempo: ${value(interview.mostTimeConsumingTask)}`,
      `Tarefa a eliminar ou simplificar: ${value(interview.taskToEliminate)}`,
      interview.eliminationReason ? `Por que: ${interview.eliminationReason}` : '',
    ]),
    section('COMO O PROCESSO FUNCIONA', [
      `Início: ${value(interview.processStart)}`,
      `Etapas: ${value(interview.processSteps)}`,
      `Pessoas: ${value(interview.processPeople)}`,
      `Trabalho manual: ${value(interview.processManualWork)}`,
      `Decisões durante o processo: ${value(interview.processDecisions)}`,
      `Como termina: ${value(interview.processEnd)}`,
      `Resultado esperado: ${value(interview.processResult)}`,
    ]),
    section('FERRAMENTAS', [
      `Ferramentas/sistemas: ${list(interview.tools)}${interview.toolsOther ? ` (${interview.toolsOther})` : ''}`,
      interview.toolsExchangeInfo ? `Trocam informações entre si: ${interview.toolsExchangeInfo}` : '',
      interview.toolsExchangeDescription ? `O que é trocado: ${interview.toolsExchangeDescription}` : '',
    ]),
    section('TRANSFERÊNCIA DE INFORMAÇÕES', [
      `Existe transferência manual: ${value(interview.hasInformationTransfer)}`,
      interview.informationSource ? `De onde vem: ${interview.informationSource}` : '',
      interview.informationDestination ? `Para onde vai: ${interview.informationDestination}` : '',
      interview.informationTransferWho ? `Quem transfere: ${interview.informationTransferWho}` : '',
      interview.informationTransferFrequency ? `Frequência: ${interview.informationTransferFrequency}` : '',
      interview.informationTransferManualEntry ? `Digitação manual: ${interview.informationTransferManualEntry}` : '',
      interview.informationTransferReview ? `Conferência depois: ${interview.informationTransferReview}` : '',
    ]),
    section('DOCUMENTOS', [
      `Trabalha com muitos documentos: ${value(interview.hasDocuments)}`,
      interview.documentTypes ? `Tipos: ${interview.documentTypes}` : '',
      interview.documentArrival ? `Como chegam: ${interview.documentArrival}` : '',
      interview.someoneReadsDocuments ? `Alguém lê: ${interview.someoneReadsDocuments}` : '',
      interview.documentExtraction ? `O que é extraído: ${interview.documentExtraction}` : '',
      interview.documentDataEntryAfter ? `Digitação depois: ${interview.documentDataEntryAfter}` : '',
      interview.documentReview ? `Conferência: ${interview.documentReview}` : '',
      interview.documentVolume ? `Volume aproximado: ${interview.documentVolume}` : '',
    ]),
    section('ESCRITA REPETITIVA', [
      `Escreve textos repetidos: ${value(interview.hasRepeatedWriting)}`,
      interview.writingContent ? `O que é escrito: ${interview.writingContent}` : '',
      interview.writingStandardization ? `Padronização: ${interview.writingStandardization}` : '',
      interview.writingWho ? `Quem escreve: ${interview.writingWho}` : '',
      interview.writingFrequency ? `Frequência: ${interview.writingFrequency}` : '',
    ]),
    section('PESQUISA', [
      `Precisa procurar informações: ${value(interview.hasInformationSearch)}`,
      interview.searchWhat ? `O que é procurado: ${interview.searchWhat}` : '',
      interview.searchWhere ? `Onde está: ${interview.searchWhere}` : '',
      interview.searchTime ? `Tempo gasto: ${interview.searchTime}` : '',
      interview.searchWho ? `Quem procura: ${interview.searchWho}` : '',
      interview.searchConcentration ? `Concentração: ${interview.searchConcentration}` : '',
      interview.searchAskOthers ? `Precisa perguntar a outra pessoa: ${interview.searchAskOthers}` : '',
    ]),
    section('RETRABALHO', [
      `Tarefas refeitas: ${value(interview.reworkTasks)}`,
      interview.reworkCause?.length ? `Causas: ${list(interview.reworkCause)}` : '',
      interview.reworkCauseOther ? `Outro motivo: ${interview.reworkCauseOther}` : '',
    ]),
    section('ERROS', [
      `Processos com erro: ${value(interview.errorProcesses)}`,
      interview.errorType ? `Tipo de erro: ${interview.errorType}` : '',
      interview.errorFrequency ? `Frequência: ${interview.errorFrequency}` : '',
      interview.errorDiscovery ? `Como são descobertos: ${interview.errorDiscovery}` : '',
      interview.errorConsequence ? `Consequência: ${interview.errorConsequence}` : '',
    ]),
    section('CONFERÊNCIAS', [
      `Tarefas com conferência: ${value(interview.reviewTasks)}`,
      interview.reviewWhat ? `O que é conferido: ${interview.reviewWhat}` : '',
      interview.reviewWho ? `Quem confere: ${interview.reviewWho}` : '',
    ]),
    section('DEPENDÊNCIA DE PESSOAS', [
      `Depende de uma pessoa específica: ${value(interview.keyPersonDependency)}`,
      interview.dependencyProcess ? `Processo dependente: ${interview.dependencyProcess}` : '',
      interview.dependencyDescription ? `O que essa pessoa sabe/faz: ${interview.dependencyDescription}` : '',
    ]),
    section('TENTATIVAS ANTERIORES', [
      `Já tentaram resolver: ${value(interview.previousAttempts)}`,
      interview.previousAttemptsWhat ? `O que tentaram: ${interview.previousAttemptsWhat}` : '',
      interview.previousAttemptsWhyNotSolved ? `Por que não resolveu: ${interview.previousAttemptsWhyNotSolved}` : '',
    ]),
    section('IMPACTO', [
      `Impacto quando dá errado: ${list(interview.impact)}`,
      interview.impactOther ? `Outro impacto: ${interview.impactOther}` : '',
    ]),
    section('RESULTADO FINAL', [`O que precisa estar pronto: ${value(interview.finalResult)}`]),
    formatDimensioning(interview),
    interview.risk
      ? section('DADOS E SEGURANÇA', [
          `Dados pessoais: ${value(interview.risk.personalData)}`,
          `Dados financeiros: ${value(interview.risk.financialData)}`,
          `Dados de clientes: ${value(interview.risk.customerData)}`,
          `Dados de funcionários: ${value(interview.risk.employeeData)}`,
          `Informações confidenciais: ${value(interview.risk.confidentialData)}`,
        ])
      : 'DADOS E SEGURANÇA\n(não avaliado — entrevista rápida)',
    section('OBSERVAÇÕES', [value(interview.additionalNotes)]),
  ]

  return sections.join('\n\n')
}

/** Corpo compacto de uma área com entrevista rápida — 10 perguntas fixas (SPEC V3 §8). */
function formatQuickArea(interview: AreaInterview): string {
  return section('RESPOSTAS (ANÁLISE RÁPIDA)', [
    `Principais tarefas: ${value(interview.mainTasks)}`,
    `Tarefa que mais consome tempo: ${value(interview.mostTimeConsumingTask)}`,
    `Tarefa a eliminar ou simplificar: ${value(interview.taskToEliminate)}`,
    `Como é feita atualmente: ${value(interview.currentProcessSummary)}`,
    `Ferramentas/sistemas: ${list(interview.tools)}${interview.toolsOther ? ` (${interview.toolsOther})` : ''}`,
    `Existe transferência manual de informações: ${value(interview.hasInformationTransfer)}`,
    `Existe retrabalho ou erro: ${value(interview.hasReworkOrErrors)}`,
    `Pessoa indispensável para o processo: ${value(interview.keyPersonDependency)}`,
    `Existem documentos envolvidos: ${value(interview.hasDocuments)}`,
    `Observações: ${value(interview.additionalNotes)}`,
  ])
}

/** Exportado para reaproveitamento pelo prompt da IA dormente (lib/ai/prompt.ts) — mesma formatação legível. */
export function formatAreaBlock(interview: AreaInterview, label: string): string {
  const header = [`Área: ${interview.area}`, `Nível: ${interview.depth === 'APROFUNDADA' ? 'APROFUNDADA' : 'RÁPIDA'}`].join('\n')
  const body = interview.depth === 'APROFUNDADA' ? formatDeepArea(interview) : formatQuickArea(interview)
  return `${SEPARATOR}\n${label}\n${SEPARATOR}\n\n${header}\n\n${body}`
}

function diagnosticModeLabel(request: DiagnosticRequest): string {
  return request.diagnosticMode === 'quick' ? 'Diagnóstico Rápido' : 'Diagnóstico Completo'
}

export function buildDiagnosticEmailSubject(request: DiagnosticRequest): string {
  return `[${diagnosticModeLabel(request)}] Nova resposta — ${request.company.companyName}`
}

export function buildDiagnosticEmailBody(request: DiagnosticRequest): string {
  const { company, interviews, contact } = request

  const modeBanner = `${SEPARATOR}\n${diagnosticModeLabel(request).toUpperCase()}\n${SEPARATOR}`

  const header = [
    'NOVO DIAGNÓSTICO DE OPORTUNIDADES COM IA',
    '',
    'EMPRESA',
    `Nome: ${value(company.companyName)}`,
    `Segmento: ${value(company.segment)}${company.segment === 'Outro' && company.segmentOther ? ` (${company.segmentOther})` : ''}`,
    `Funcionários: ${value(company.employeeRange)}`,
    `Atividade principal: ${value(company.mainBusinessActivity)}`,
    '',
    'RESPONSÁVEL',
    `Nome: ${value(contact.responsibleName)}`,
    `WhatsApp: ${value(contact.whatsapp)}`,
    `E-mail: ${value(contact.email)}`,
  ].join('\n')

  const areaLabels = ['ÁREA PRIORITÁRIA', 'ÁREA COMPLEMENTAR 1', 'ÁREA COMPLEMENTAR 2']
  const areaBlocks = interviews.map((interview, index) => formatAreaBlock(interview, areaLabels[index] ?? `ÁREA ${index + 1}`))

  return [modeBanner, header, ...areaBlocks, `${SEPARATOR}\nFIM DO DIAGNÓSTICO\n${SEPARATOR}`].join('\n\n')
}

export function buildDiagnosticEmail(request: DiagnosticRequest): { subject: string; text: string } {
  return {
    subject: buildDiagnosticEmailSubject(request),
    text: buildDiagnosticEmailBody(request),
  }
}
