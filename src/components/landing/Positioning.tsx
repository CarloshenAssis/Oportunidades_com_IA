import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Section'

const PATHS = [
  'Às vezes, a melhor solução é uma automação simples.',
  'Às vezes, uma integração entre sistemas.',
  'Às vezes, uma mudança no processo.',
  'E, em alguns casos, IA realmente faz sentido.',
]

export function Positioning() {
  return (
    <section className="bg-primary py-20 sm:py-28">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Eyebrow className="text-blue-400">Método</Eyebrow>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white sm:text-3xl sm:leading-tight">
              Não começamos pela ferramenta.
            </h2>
            <p className="mt-4 leading-relaxed text-slate-300">
              Não partimos de uma ferramenta específica procurando um problema para ela resolver.
            </p>
          </div>

          <div className="lg:col-span-7">
            <ul className="space-y-4">
              {PATHS.map((path) => (
                <li key={path} className="border-l border-slate-700 pl-5 leading-relaxed text-slate-300">
                  {path}
                </li>
              ))}
            </ul>

            <p className="mt-8 leading-relaxed text-white">
              Primeiro entendemos o processo. Depois avaliamos se existe uma oportunidade de
              melhorar, automatizar, integrar ou utilizar IA.
            </p>
          </div>
        </div>
      </Container>
    </section>
  )
}
