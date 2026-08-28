const STEP_LABELS = ['Empresa', 'Operação', 'Problemas', 'Tecnologia', 'Contato']

export function ProgressBar({ step, totalSteps }: { step: number; totalSteps: number }) {
  const percentage = (step / totalSteps) * 100

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-primary">
          Etapa {step} de {totalSteps}
        </span>
        <span className="text-muted">{STEP_LABELS[step - 1]}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Etapa ${step} de ${totalSteps}: ${STEP_LABELS[step - 1]}`}
        className="h-2 w-full overflow-hidden rounded-full bg-surface"
      >
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
