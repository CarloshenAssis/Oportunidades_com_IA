export function ExecutiveSummary({ summary }: { summary: string }) {
  return (
    <div>
      <h2 className="mb-3 text-xl font-semibold tracking-tight text-primary">Resumo executivo</h2>
      <p className="leading-relaxed text-primary/90">{summary}</p>
    </div>
  )
}
