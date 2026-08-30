import { Eyebrow, Section } from '@/components/ui/Section'

export function About() {
  return (
    <Section surface>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <Eyebrow>Responsável pela análise</Eyebrow>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
            Quem está por trás do diagnóstico
          </h2>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-xl border border-border bg-white p-8">
            <p className="text-lg font-semibold text-primary">Carlos Henrique</p>
            <p className="mt-3 leading-relaxed text-muted">
              Profissional em formação na área de Ciências Contábeis, com atuação e estudos voltados a
              processos, tecnologia e Inteligência Artificial aplicada a negócios.
            </p>
            <p className="mt-4 border-t border-border pt-4 leading-relaxed text-muted">
              O objetivo é entender primeiro o funcionamento da empresa para só então avaliar onde
              tecnologia pode gerar valor.
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}
