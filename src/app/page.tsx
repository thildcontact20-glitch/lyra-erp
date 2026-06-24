'use client'

import HeroSection from '../components/home/HeroSection'
import FeaturesSection from '../components/home/FeaturesSection'
import PricingSection from '../components/home/PricingSection'
import StatsSection from '../components/home/StatsSection'
import Footer from '../components/home/Footer'

/* ──────────────────────────────────────────────────────────────────────────────
   Page d'accueil — LYRA by Vivalys
   Landing page premium sans motifs wax ni armoiries
   ────────────────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-lyra-dark">
      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <PricingSection />
        <Footer />
      </div>
    </main>
  )
}
