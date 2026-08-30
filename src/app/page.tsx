import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { ProblemSection } from '@/components/landing/ProblemSection'
import { AnalysisScope } from '@/components/landing/AnalysisScope'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Positioning } from '@/components/landing/Positioning'
import { About } from '@/components/landing/About'
import { ModeSelector } from '@/components/landing/ModeSelector'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export default function Home() {
  return (
    <>
      <Header />
      {/* Narrativa: problema → diagnóstico → oportunidade → solução. */}
      <main className="flex-1">
        <Hero />
        <ProblemSection />
        <AnalysisScope />
        <HowItWorks />
        <Positioning />
        <About />
        <ModeSelector />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
