'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Check, Star, Users, Building2, Zap, Shield } from 'lucide-react'
import TiltCard from '../ui/TiltCard'
import GlowButton from '../ui/GlowButton'

interface Plan {
  id: string
  name: string
  tagline: string
  monthlyPrice: number
  yearlyPrice: number
  maxUsers: string
  maxCompanies: string
  popular: boolean
  enterprise: boolean
  icon: React.ReactNode
  features: { label: string; included: boolean }[]
}

const plans: Plan[] = [
  {
    id: 'starter', name: 'Starter',
    tagline: 'Idéal pour les TPE et indépendants',
    monthlyPrice: 19900, yearlyPrice: 199000,
    maxUsers: '3 utilisateurs', maxCompanies: '1 société',
    popular: false, enterprise: false,
    icon: <Zap className="w-5 h-5" />,
    features: [
      { label: 'Comptabilité SYSCOHADA', included: true },
      { label: 'Gestion commerciale', included: true },
      { label: 'Stocks', included: true },
      { label: 'Dashboard analytique', included: true },
      { label: 'États financiers', included: true },
      { label: 'Paie & CNPS', included: false },
      { label: 'Fiscalité ivoirienne', included: false },
      { label: 'Chat OHADA', included: false },
      { label: 'Multi-sociétés', included: false },
      { label: 'Support prioritaire', included: false },
    ],
  },
  {
    id: 'business', name: 'Business',
    tagline: 'La solution complète pour PME',
    monthlyPrice: 49900, yearlyPrice: 499000,
    maxUsers: '10 utilisateurs', maxCompanies: '3 sociétés',
    popular: true, enterprise: false,
    icon: <Building2 className="w-5 h-5" />,
    features: [
      { label: 'Comptabilité SYSCOHADA', included: true },
      { label: 'Gestion commerciale', included: true },
      { label: 'Stocks', included: true },
      { label: 'Dashboard analytique', included: true },
      { label: 'États financiers', included: true },
      { label: 'Paie & CNPS', included: true },
      { label: 'Fiscalité ivoirienne', included: true },
      { label: 'Chat OHADA', included: true },
      { label: 'Multi-sociétés', included: true },
      { label: 'Support prioritaire', included: false },
    ],
  },
  {
    id: 'enterprise', name: 'Entreprise',
    tagline: 'Sur mesure pour grandes organisations',
    monthlyPrice: 99900, yearlyPrice: 999000,
    maxUsers: 'Utilisateurs illimités', maxCompanies: 'Sociétés illimitées',
    popular: false, enterprise: true,
    icon: <Shield className="w-5 h-5" />,
    features: [
      { label: 'Comptabilité SYSCOHADA', included: true },
      { label: 'Gestion commerciale', included: true },
      { label: 'Stocks', included: true },
      { label: 'Dashboard analytique', included: true },
      { label: 'États financiers', included: true },
      { label: 'Paie & CNPS', included: true },
      { label: 'Fiscalité ivoirienne', included: true },
      { label: 'Chat OHADA', included: true },
      { label: 'Multi-sociétés', included: true },
      { label: 'Support prioritaire', included: true },
    ],
  },
]

function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function PlanCard({ plan, yearly, index }: { plan: Plan; yearly: boolean; index: number }) {
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice
  const period = yearly ? '/an' : '/mois'

  return (
    <TiltCard tiltMax={5} glowColor="rgba(212,175,55,0.08)">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] }}
        className={`relative flex flex-col rounded-2xl ${
          plan.popular
            ? 'border-2 border-lyra-gold/60 shadow-[0_0_30px_rgba(201,169,97,0.15)] scale-[1.02] md:scale-105 z-10'
            : 'border border-white/10 hover:border-lyra-gold/30'
        } bg-gradient-to-b from-white/[0.03] to-white/[0.01] backdrop-blur-xl transition-all duration-500`}
        whileHover={
          plan.popular
            ? { y: -6, boxShadow: '0 0 50px rgba(201,169,97,0.25)' }
            : { y: -4, borderColor: 'rgba(201,169,97,0.4)', boxShadow: '0 0 20px rgba(201,169,97,0.1)' }
        }
      >
        {plan.popular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center gap-1.5 bg-lyra-gold text-lyra-dark text-[10px] font-bold px-4 py-1.5 rounded-full shadow-lg shadow-lyra-gold/30">
              <Star className="w-3 h-3 fill-current" />
              POPULAIRE
            </span>
          </div>
        )}

        <div className="p-6 md:p-8 flex flex-col h-full">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${plan.popular ? 'bg-lyra-gold/20 text-lyra-gold' : 'bg-white/5 text-lyra-cream/70'}`}>
                {plan.icon}
              </div>
              <h3 className="text-xl font-bold font-display text-lyra-cream">{plan.name}</h3>
            </div>
            <p className="text-sm text-lyra-cream/60">{plan.tagline}</p>
          </div>

          <div className="mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-bold font-display text-lyra-cream">
                {formatPrice(price)}
              </span>
              <span className="text-lyra-gold font-semibold text-lg">FCFA</span>
              <span className="text-lyra-cream/50 text-sm ml-1">{period}</span>
            </div>
            {yearly && (
              <p className="text-xs text-green-400 mt-1 font-medium">
                ✦ Économisez {formatPrice(plan.monthlyPrice * 12 - plan.yearlyPrice)} FCFA / an
              </p>
            )}
          </div>

          <div className="flex gap-4 mb-6 pb-6 border-b border-white/5">
            <div className="flex items-center gap-1.5 text-sm text-lyra-cream/70">
              <Users className="w-4 h-4 text-lyra-gold/60" />
              {plan.maxUsers}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-lyra-cream/70">
              <Building2 className="w-4 h-4 text-lyra-gold/60" />
              {plan.maxCompanies}
            </div>
          </div>

          <ul className="space-y-2.5 mb-8 flex-1">
            {plan.features.map((feat) => (
              <li key={feat.label} className="flex items-start gap-3 text-sm">
                {feat.included ? (
                  <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                ) : (
                  <span className="w-4 h-4 mt-0.5 shrink-0 flex items-center justify-center text-red-400/30 text-xs">—</span>
                )}
                <span className={feat.included ? 'text-lyra-cream/85' : 'text-lyra-cream/30'}>
                  {feat.label}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-auto">
            {plan.enterprise ? (
              <GlowButton href="mailto:contact@vivalyscompagny.com" variant="outline" className="w-full justify-center">
                Contacter les ventes
              </GlowButton>
            ) : (
              <GlowButton
                href={`/signup?plan=${plan.id}&billing=${yearly ? 'yearly' : 'monthly'}`}
                variant={plan.popular ? 'primary' : 'secondary'}
                className="w-full justify-center"
              >
                Commencer
              </GlowButton>
            )}
          </div>
        </div>
      </motion.div>
    </TiltCard>
  )
}

function BillingToggle({ yearly, setYearly }: { yearly: boolean; setYearly: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-4 justify-center">
      <span className={`text-sm font-medium transition-colors ${!yearly ? 'text-lyra-cream' : 'text-lyra-cream/40'}`}>
        Mensuel
      </span>
      <button
        onClick={() => setYearly(!yearly)}
        className="relative w-14 h-7 rounded-full bg-white/10 border border-white/10 cursor-pointer transition-colors hover:border-lyra-gold/30"
        aria-label="Basculer mensuel/annuel"
      >
        <motion.div
          animate={{ x: yearly ? 28 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 left-0 w-5 h-5 rounded-full bg-lyra-gold shadow-md shadow-lyra-gold/30"
        />
      </button>
      <span className={`text-sm font-medium transition-colors ${yearly ? 'text-lyra-cream' : 'text-lyra-cream/40'}`}>
        Annuel
      </span>
      {yearly && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs bg-green-500/15 text-green-400 px-2.5 py-1 rounded-full font-medium border border-green-500/20"
        >
          -2 mois offerts
        </motion.span>
      )}
    </div>
  )
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false)

  return (
    <section
      id="pricing"
      className="relative py-24 md:py-32 overflow-hidden min-h-screen"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lyra-gold/15 to-transparent" />
      <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-lyra-gold/3 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-lyra-steel/3 blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* En-tête */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-block text-lyra-gold text-[10px] tracking-[0.25em] uppercase mb-3">
            Nos offres
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-lyra-cream mb-4">
            Des plans adaptés à votre croissance
          </h2>
          <p className="text-white/40 max-w-xl mx-auto text-sm md:text-base">
            Choisissez la formule qui correspond à la taille de votre entreprise.
            Évoluez à votre rythme, sans engagement.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-12"
        >
          <BillingToggle yearly={yearly} setYearly={setYearly} />
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-6 items-start">
          {plans.map((plan, i) => (
            <PlanCard key={plan.id} plan={plan} yearly={yearly} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
