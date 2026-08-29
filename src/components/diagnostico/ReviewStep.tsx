import type { AreaInterview, CompanyMap, ContactData, DiagnosticMode } from '@/types/diagnostic'

type Props = {
  diagnosticMode: DiagnosticMode
  companyMap: CompanyMap
  interviews: AreaInterview[]
  contact: ContactData
}

/** SPEC V3 §12: ÁREA PRIORITÁRIA / ÁREA COMPLEMENTAR 1 / ÁREA COMPLEMENTAR 2. */
const AREA_LABELS = ['ÁREA PRIORITÁRIA', 'ÁREA COMPLEMENTAR 1', 'ÁREA COMPLEMENTAR 2']

/** Campos comuns aos dois modos de entrevista (rápido e aprofundado). */
const COMMON_FIELD_LABELS: Array<[keyof AreaInterview, string]> = [
  ['mainTasks', 'Principais tarefas'],
  ['mostTimeConsumingTask', 'Tarefa que mais consome tempo'],
  ['taskToEliminate', 'Tarefa a eliminar ou simplificar'],
  ['currentProcessSummary', 'Como é feito atualmente'],
  ['hasInformationTransfer', 'Transferência manual de informações'],
  ['keyPersonDependency', 'Dependência de pessoa específica'],
  ['hasDocuments', 'Documentos envolvidos'],
  ['additionalNotes', 'Observações'],
]

/** Campos exclusivos do modo aprofundado (blocos A, C, G–N). */
const DEEP_ONLY_FIELD_LABELS: Array<[keyof AreaInterview, string]> = [
  ['dailyRepetitiveTasks', 'Tarefas diárias'],
  ['weeklyRepetitiveTasks', 'Tarefas semanais'],
  ['monthlyRepetitiveTasks', 'Tarefas mensais'],
  ['eliminationReason', 'Por que eliminaria essa tarefa'],
  ['processSteps', 'Principais etapas do processo'],
  ['hasRepeatedWriting', 'Escrita repetitiva'],
  ['hasInformationSearch', 'Busca de informações'],
  ['reworkTasks', 'Tarefas com retrabalho'],
  ['errorProcesses', 'Processos com erros'],
  ['previousAttempts', 'Já tentaram resolver antes'],
  ['finalResult', 'Resultado final esperado'],
]

function Row({ label, value }: { label: string; value?: string }) {
  const trimmed = value?.trim()
  if (!trimmed) return null
  return (
    <div className="border-b border-border py-2 last:border-b-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-0.5 text-sm text-primary">{trimmed}</p>
    </div>
  )
}

export function ReviewStep({ diagnosticMode, companyMap, interviews, contact }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
          Tipo de diagnóstico: {diagnosticMode === 'quick' ? 'Rápido' : 'Completo'}
        </span>
      </div>

      <p className="text-sm text-muted">Confira suas respostas antes de enviar. Você pode voltar para corrigir qualquer campo.</p>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Empresa</h2>
        <div className="rounded-lg border border-border bg-surface p-4">
          <Row label="Nome" value={companyMap.companyName} />
          <Row label="Segmento" value={companyMap.segmentOther ? `${companyMap.segment} (${companyMap.segmentOther})` : companyMap.segment} />
          <Row label="Funcionários" value={companyMap.employeeRange} />
          <Row label="Atividade principal" value={companyMap.mainBusinessActivity} />
          <Row
            label="Áreas investigadas"
            value={interviews
              .map((interview, index) => `${AREA_LABELS[index] ?? `Área ${index + 1}`}: ${interview.area} (${interview.depth === 'APROFUNDADA' ? 'aprofundada' : 'rápida'})`)
              .join(' · ')}
          />
        </div>
      </section>

      {interviews.map((interview, index) => (
        <section key={interview.area}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">
            {AREA_LABELS[index] ?? `ÁREA ${index + 1}`}: {interview.area}
          </h2>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Nível: {interview.depth === 'APROFUNDADA' ? 'APROFUNDADA' : 'RÁPIDA'}
          </p>
          <div className="rounded-lg border border-border bg-surface p-4">
            {COMMON_FIELD_LABELS.map(([field, label]) => (
              <Row key={field} label={label} value={interview[field] as string | undefined} />
            ))}
            {interview.depth === 'APROFUNDADA'
              ? DEEP_ONLY_FIELD_LABELS.map(([field, label]) => (
                  <Row key={field} label={label} value={interview[field] as string | undefined} />
                ))
              : null}
            {interview.quantitativeSizing?.taskLabel ? (
              <Row label="Tarefa escolhida para dimensionar" value={interview.quantitativeSizing.taskLabel} />
            ) : null}
          </div>
        </section>
      ))}

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Contato</h2>
        <div className="rounded-lg border border-border bg-surface p-4">
          <Row label="Responsável" value={contact.responsibleName} />
          <Row label="WhatsApp" value={contact.whatsapp} />
          <Row label="E-mail" value={contact.email} />
        </div>
      </section>
    </div>
  )
}
