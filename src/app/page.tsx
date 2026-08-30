import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { Positioning } from '@/components/landing/Positioning'
import { About } from '@/components/landing/About'
import { AnalysisScope } from '@/components/landing/AnalysisScope'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { TrustNotes } from '@/components/landing/TrustNotes'
import { ModeSelector } from '@/components/landing/ModeSelector'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export default function Home() {
  return (
    <>
      <Header />
      {/*
        Hierarquia de confiança: problema → método → quem está por trás →
        o que é analisado → o que acontece com as respostas → escolha → preencher.
      */}
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <Positioning />
        <About />
        <AnalysisScope />
        <HowItWorks />
        <TrustNotes />
        <ModeSelector />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
