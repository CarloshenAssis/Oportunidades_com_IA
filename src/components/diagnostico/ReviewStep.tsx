import type { AreaInterview, CompanyMap, ContactData } from '@/types/diagnostic'

type Props = {
  companyMap: CompanyMap
  interviews: AreaInterview[]
  contact: ContactData
}

const AREA_FIELD_LABELS: Array<[keyof AreaInterview, string]> = [
  ['dailyRepetitiveTasks', 'Tarefas diárias'],
  ['weeklyRepetitiveTasks', 'Tarefas semanais'],
  ['monthlyRepetitiveTasks', 'Tarefas mensais'],
  ['mostTimeConsumingTask', 'Tarefa que mais consome tempo'],
  ['taskTheyWouldEliminate', 'Tarefa que gostaria de eliminar'],
  ['copyPasteTasks', 'Transferência de informações'],
  ['documentTasks', 'Documentos'],
  ['repeatedWritingTasks', 'Escrita repetitiva'],
  ['informationSearchTasks', 'Pesquisa de informação'],
  ['reworkProcess', 'Retrabalho'],
  ['errorProneTasks', 'Erros'],
  ['manualReviewTasks', 'Conferências manuais'],
  ['keyPersonDependency', 'Dependência de pessoas'],
  ['taskToEliminate', 'Tarefa que eliminaria amanhã'],
  ['additionalNotes', 'Observações'],
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

export function ReviewStep({ companyMap, interviews, contact }: Props) {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-sm text-muted">Confira suas respostas antes de enviar. Você pode voltar para corrigir qualquer campo.</p>

      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Empresa</h2>
        <div className="rounded-lg border border-border bg-surface p-4">
          <Row label="Nome" value={companyMap.companyName} />
          <Row label="Segmento" value={companyMap.segmentOther ? `${companyMap.segment} (${companyMap.segmentOther})` : companyMap.segment} />
          <Row label="Funcionários" value={companyMap.employeeRange} />
          <Row label="Atividade principal" value={companyMap.mainBusinessActivity} />
          <Row label="Áreas prioritárias" value={companyMap.priorityAreas.map((p) => `${p.area} (${p.reason})`).join(' · ')} />
        </div>
      </section>

      {interviews.map((interview) => (
        <section key={interview.area}>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-accent">Área: {interview.area}</h2>
          <div className="rounded-lg border border-border bg-surface p-4">
            {AREA_FIELD_LABELS.map(([field, label]) => (
              <Row key={field} label={label} value={interview[field] as string | undefined} />
            ))}
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
