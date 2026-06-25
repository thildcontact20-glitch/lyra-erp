'use client'

import HeroSection from '../components/home/HeroSection'
import FeaturesSection from '../components/home/FeaturesSection'
import PricingSection from '../components/home/PricingSection'
import StatsSection from '../components/home/StatsSection'
import Footer from '../components/home/Footer'
import PlumeBackground from '../components/home/PlumeBackground'
import ScrollingBanner from '../components/ambiance/ScrollingBanner'
import ProverbDisplay from '../components/ambiance/ProverbDisplay'
import RealtimeClock from '../components/ambiance/RealtimeClock'
import WeatherWidget from '../components/ambiance/WeatherWidget'

/* ──────────────────────────────────────────────────────────────────────────────
   Page d'accueil — LYRA by Vivalys
   ────────────────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-lyra-dark">
      {/* Scrolling banner tout en haut */}
      <ScrollingBanner />

      {/* Plume en fond — couvre toute la page */}
      <PlumeBackground />
      
      {/* Horloge et météo dans un coin discret en haut */}
      <div className="relative z-10 flex items-center justify-end gap-4 px-4 sm:px-6 lg:px-8 pt-3">
        <RealtimeClock format="time-only" />
        <WeatherWidget compact />
      </div>

      <div className="relative z-10">
        <HeroSection />

        {/* Proverbe sous le HeroSection */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 mb-8">
          <ProverbDisplay page="home" />
        </div>
        <FeaturesSection />
        <StatsSection />
        <PricingSection />
        <Footer />
      </div>
    </main>
  )
}
