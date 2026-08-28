import type { DiagnosticFormData } from '@/types/diagnostic'

export type StepProps = {
  data: DiagnosticFormData
  errors: Record<string, string>
  onChange: <K extends keyof DiagnosticFormData>(field: K, value: DiagnosticFormData[K]) => void
}
