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

function formatSection(label: string, main: string | undefined, extras: Array<string | ''>): string {
  const lines = [`${label}:`, value(main), ...extras.filter(Boolean)]
  return lines.join('\n')
}

function formatSizing(interview: AreaInterview): string {
  const sizing = interview.quantitativeSizing
  if (!sizing) return 'Dimensionamento:\n(nenhuma tarefa desta área foi dimensionada)'

  const monthlyHours = computeMonthlyHours({
    peopleCount: sizing.peopleCount,
    monthlyExecutions: sizing.monthlyExecutions ?? undefined,
    minutesPerExecution: sizing.minutesPerExecution,
  })
  const monthlyCost = computeMonthlyCost(monthlyHours, interview.hourlyCost)

  const lines = [
    'Dimensionamento:',
    `Tarefa: ${sizing.taskLabel}`,
    `Pessoas envolvidas: ${sizing.peopleCount ?? '(não informado)'}`,
    `Frequência: ${sizing.executionFrequency || '(não informado)'}`,
    `Minutos por execução: ${sizing.minutesPerExecution ?? '(não informado)'}`,
    `Execuções por mês: ${sizing.monthlyExecutions ?? '(não sei / não informado)'}`,
    sizing.executionVariation ? `Variação entre execuções: ${sizing.executionVariation}` : '',
    `Horas/mês estimadas: ${monthlyHours ?? '(dados insuficientes)'} — estimativa gerencial`,
    interview.hourlyCost ? `Custo/hora informado: ${interview.hourlyCost}` : '',
    monthlyCost !== null ? `Custo mensal estimado: ${monthlyCost} — estimativa gerencial` : '',
  ]
  return lines.filter(Boolean).join('\n')
}

function formatAreaBlock(interview: AreaInterview, index: number): string {
  const sections = [
    formatSection('Tarefas diárias', interview.dailyRepetitiveTasks, []),
    formatSection('Tarefas semanais', interview.weeklyRepetitiveTasks, []),
    formatSection('Tarefas mensais', interview.monthlyRepetitiveTasks, []),
    formatSection('Tarefa que mais consome tempo', interview.mostTimeConsumingTask, [
      interview.taskPainReason ? `Por que incomoda: ${interview.taskPainReason}` : '',
    ]),
    formatSection('Tarefa que gostaria de eliminar (rotina)', interview.taskTheyWouldEliminate, []),
    formatSection('Transferência de informações (copiar/colar)', interview.copyPasteTasks, [
      interview.informationTransfer ? `De onde vem / para onde vai: ${interview.informationTransfer}` : '',
      interview.transferFrequency ? `Frequência: ${interview.transferFrequency}` : '',
    ]),
    formatSection('Documentos', interview.documentTasks, [
      interview.documentExtraction ? `O que precisam extrair: ${interview.documentExtraction}` : '',
      interview.documentDataEntry ? `Precisa digitar/transferir depois: ${interview.documentDataEntry}` : '',
    ]),
    formatSection('Escrita repetitiva', interview.repeatedWritingTasks, [
      interview.writingVariation ? `O que varia de uma vez para outra: ${interview.writingVariation}` : '',
    ]),
    formatSection('Pesquisa de informação', interview.informationSearchTasks, [
      interview.informationSources?.length ? `Fontes: ${list(interview.informationSources)}` : '',
      interview.informationSearchTime ? `Tempo gasto buscando: ${interview.informationSearchTime}` : '',
    ]),
    formatSection('Retrabalho', interview.reworkProcess, [
      interview.reworkReason?.length ? `Causas: ${list(interview.reworkReason)}` : '',
    ]),
    formatSection('Erros', interview.errorProneTasks, [
      interview.errorConsequence ? `Consequência: ${interview.errorConsequence}` : '',
    ]),
    formatSection('Conferências manuais', interview.manualReviewTasks, [
      interview.reviewCriteria ? `O que é conferido: ${interview.reviewCriteria}` : '',
    ]),
    formatSection('Dependência de pessoas', interview.keyPersonDependency, [
      interview.dependencyDescription ? `Detalhe: ${interview.dependencyDescription}` : '',
    ]),
    formatSection('Tarefa que eliminaria amanhã', interview.taskToEliminate, [
      interview.eliminationReason ? `Motivo: ${interview.eliminationReason}` : '',
    ]),
    formatSizing(interview),
    formatSection('Observações', interview.additionalNotes, []),
  ]

  return `ÁREA ${index + 1} — ${interview.area.toUpperCase()}\n\n${sections.join('\n\n')}`
}

function formatSecuritySection(interviews: AreaInterview[]): string {
  const rows: Array<[string, keyof AreaInterview['risk']]> = [
    ['Dados pessoais', 'personalData'],
    ['Dados financeiros', 'financialData'],
    ['Dados de clientes', 'customerData'],
    ['Dados de funcionários', 'employeeData'],
    ['Informações confidenciais', 'confidentialData'],
  ]

  const lines = rows.map(([label, key]) => {
    const perArea = interviews.map((interview) => `${interview.area}: ${interview.risk[key] || '(não informado)'}`).join(' | ')
    return `${label}:\n${perArea}`
  })

  return `DADOS E SEGURANÇA\n\n${lines.join('\n\n')}`
}

export function buildDiagnosticEmailSubject(request: DiagnosticRequest): string {
  return `Novo Diagnóstico de IA — ${request.company.companyName}`
}

export function buildDiagnosticEmailBody(request: DiagnosticRequest): string {
  const { company, priorityAreas, interviews, contact } = request

  const header = [
    'NOVO DIAGNÓSTICO DE OPORTUNIDADES COM IA',
    '',
    'EMPRESA',
    `Nome: ${value(company.companyName)}`,
    `Segmento: ${value(company.segment)}${company.segment === 'Outro' && company.segmentOther ? ` (${company.segmentOther})` : ''}`,
    `Funcionários: ${value(company.employeeRange)}`,
    `Atividade principal: ${value(company.mainBusinessActivity)}`,
    '',
    'ÁREAS PRIORITÁRIAS',
    ...priorityAreas.map((priorityArea, index) => `${index + 1}. ${priorityArea.area} — ${priorityArea.reason}`),
  ].join('\n')

  const areaBlocks = interviews.map((interview, index) => formatAreaBlock(interview, index)).join(`\n\n${SEPARATOR}\n\n`)

  const securitySection = formatSecuritySection(interviews)

  const contactSection = [
    'CONTATO',
    '',
    `Responsável: ${value(contact.responsibleName)}`,
    `WhatsApp: ${value(contact.whatsapp)}`,
    `E-mail: ${value(contact.email)}`,
  ].join('\n')

  return [header, areaBlocks, securitySection, contactSection].join(`\n\n${SEPARATOR}\n\n`)
}

export function buildDiagnosticEmail(request: DiagnosticRequest): { subject: string; text: string } {
  return {
    subject: buildDiagnosticEmailSubject(request),
    text: buildDiagnosticEmailBody(request),
  }
}
