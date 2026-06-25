'use client'

import { motion } from 'framer-motion'
import FadeInView from '../ui/FadeInView'

const features = [
  { icon: '📊', title: 'Comptabilité', description: 'Tenue conforme au LYRA révisé : journaux, grands livres, balance, États financiers (Bilan, CP, ETG, ECI, TAFIRE) générés automatiquement.' },
  { icon: '📦', title: 'Gestion des stocks', description: 'Suivi des entrées/sorties, inventaire, valorisation (FIFO, CMP), alertes de seuil et reporting multi-dépôts en temps réel.' },
  { icon: '💰', title: 'Paie & CNPS', description: 'Calcul automatisé des bulletins de paie, des cotisations CNPS, déclarations mensuelles et bilan social annuel.' },
  { icon: '📋', title: 'Fiscalité ivoirienne', description: 'Déclarations pré-remplies (TVA, BIC, IRS, contribution nationale), édition des états DGI et génération des quitus fiscaux.' },
  { icon: '🤖', title: 'Chat LYRA', description: 'Assistant IA spécialisé en droit LYRA et fiscalité ivoirienne. Posez vos questions en langage naturel et obtenez des réponses référencées.' },
  { icon: '📈', title: 'Rapports & analytics', description: 'Dashboards personnalisables, analyses comparatives, reporting financier multi-société et export PDF/Excel de tous les états.' },
]

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <FadeInView direction="up" delay={index * 0.1}>
      <motion.div
        className="group relative rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm p-6 md:p-8 hover:border-lyra-gold/20 transition-all duration-500"
        whileHover={{ y: -6 }}
      >
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-lyra-gold/[0.03] to-transparent pointer-events-none" />

        <div className="relative z-10 mb-5">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-lyra-gold/10 to-lyra-gold/5 border border-lyra-gold/10 flex items-center justify-center text-2xl group-hover:border-lyra-gold/30 group-hover:scale-110 transition-all duration-500">
            {feature.icon}
          </div>
        </div>

        <h3 className="relative z-10 text-lg font-semibold font-display text-lyra-cream mb-3 group-hover:text-lyra-gold transition-colors duration-300">
          {feature.title}
        </h3>

        <p className="relative z-10 text-sm text-white/40 leading-relaxed">
          {feature.description}
        </p>

        <div className="relative z-10 mt-5 h-px w-0 bg-gradient-to-r from-lyra-gold/30 to-transparent group-hover:w-full transition-all duration-500" />
      </motion.div>
    </FadeInView>
  )
}

export default function FeaturesSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lyra-gold/15 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* En-tête section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block text-lyra-gold text-[10px] tracking-[0.25em] uppercase mb-3">
            Fonctionnalités
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-lyra-cream mb-4">
            Tout ce dont votre PME a besoin
          </h2>
          <p className="text-white/40 max-w-xl mx-auto text-sm md:text-base">
            Un ERP complet couvrant l&apos;intégralité de votre gestion
            d&apos;entreprise, en conformité avec les normes LYRA.
          </p>
        </motion.div>

        {/* Grid des fonctionnalités */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
