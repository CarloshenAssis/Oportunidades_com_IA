type Props = {
  label: string
  step: number
  totalSteps: number
}

export function ProgressBar({ label, step, totalSteps }: Props) {
  const percentage = totalSteps > 0 ? Math.min(100, (step / totalSteps) * 100) : 0

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-primary">
          Etapa {step} de {totalSteps}
        </span>
        <span className="text-muted">{label}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Etapa ${step} de ${totalSteps}: ${label}`}
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
