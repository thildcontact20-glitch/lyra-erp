'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Check, X, Star, Shield, Zap, Building2, Users, ChevronDown, ArrowLeft, HelpCircle, Info } from 'lucide-react'
import ButtonElegant from '../../components/ui/ButtonElegant'
import PageTransition from '../../components/animations/PageTransition'
import { fadeUpVariants, staggerContainerVariants, listItemVariants } from '../../lib/framerVariants'
import ScrollingBanner from '../../components/ambiance/ScrollingBanner'
import ProverbDisplay from '../../components/ambiance/ProverbDisplay'

/* ---------- Types ---------- */
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
  features: { label: string; included: boolean }[]
  gradient: string
  icon: React.ReactNode
}

/* ---------- Data ---------- */
const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Idéal pour les TPE et indépendants',
    monthlyPrice: 19900,
    yearlyPrice: 199000,
    maxUsers: '3 utilisateurs',
    maxCompanies: '1 société',
    popular: false,
    enterprise: false,
    gradient: 'from-lyra-dark via-lyra-navy to-lyra-dark',
    icon: <Zap className="w-6 h-6" />,
    features: [
      { label: 'Comptabilité SYSCOHADA', included: true },
      { label: 'Gestion commerciale', included: true },
      { label: 'Stocks', included: true },
      { label: 'Paie & CNPS', included: false },
      { label: 'Fiscalité ivoirienne', included: false },
      { label: 'États financiers', included: true },
      { label: 'Dashboard analytique', included: true },
      { label: 'Chat LYRA', included: false },
      { label: 'Multi-sociétés', included: false },
      { label: 'Workflows', included: false },
      { label: 'Rôles avancés', included: false },
      { label: 'Rapports personnalisés', included: false },
      { label: 'Support prioritaire', included: false },
    ],
  },
  {
    id: 'business',
    name: 'Business',
    tagline: 'La solution complète pour PME',
    monthlyPrice: 49900,
    yearlyPrice: 499000,
    maxUsers: '10 utilisateurs',
    maxCompanies: '3 sociétés',
    popular: true,
    enterprise: false,
    gradient: 'from-lyra-gold/10 via-lyra-navy to-lyra-dark',
    icon: <Building2 className="w-6 h-6" />,
    features: [
      { label: 'Comptabilité SYSCOHADA', included: true },
      { label: 'Gestion commerciale', included: true },
      { label: 'Stocks', included: true },
      { label: 'Paie & CNPS', included: true },
      { label: 'Fiscalité ivoirienne', included: true },
      { label: 'États financiers', included: true },
      { label: 'Dashboard analytique', included: true },
      { label: 'Chat LYRA', included: true },
      { label: 'Multi-sociétés', included: true },
      { label: 'Workflows', included: false },
      { label: 'Rôles avancés', included: false },
      { label: 'Rapports personnalisés', included: false },
      { label: 'Support prioritaire', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Sur mesure pour grandes organisations',
    monthlyPrice: 99900,
    yearlyPrice: 999000,
    maxUsers: 'Utilisateurs illimités',
    maxCompanies: 'Sociétés illimitées',
    popular: false,
    enterprise: true,
    gradient: 'from-lyra-steel/20 via-lyra-dark to-lyra-dark',
    icon: <Shield className="w-6 h-6" />,
    features: [
      { label: 'Comptabilité SYSCOHADA', included: true },
      { label: 'Gestion commerciale', included: true },
      { label: 'Stocks', included: true },
      { label: 'Paie & CNPS', included: true },
      { label: 'Fiscalité ivoirienne', included: true },
      { label: 'États financiers', included: true },
      { label: 'Dashboard analytique', included: true },
      { label: 'Chat LYRA', included: true },
      { label: 'Multi-sociétés', included: true },
      { label: 'Workflows', included: true },
      { label: 'Rôles avancés', included: true },
      { label: 'Rapports personnalisés', included: true },
      { label: 'Support prioritaire', included: true },
    ],
  },
]

/* ---------- FAQ Data ---------- */
const faqs = [
  {
    q: 'Puis-je changer de plan ?',
    a: 'Absolument. Vous pouvez passer à un plan supérieur à tout moment depuis votre espace administration. La mise à niveau est immédiate et vous ne payez que la différence au prorata du mois en cours. Un passage à un plan inférieur est possible en fin de cycle de facturation.',
  },
  {
    q: 'Y a-t-il un engagement ?',
    a: 'Aucun engagement. Tous nos plans sont sans engagement de durée. Vous pouvez résilier à tout moment depuis votre tableau de bord. Avec la formule annuelle, vous bénéficiez de 2 mois offerts tout en restant libre de ne pas renouveler.',
  },
  {
    q: 'Comment se fait l\'activation ?',
    a: 'L\'activation est instantanée dès confirmation de votre paiement. Vous recevez un email avec vos identifiants et un lien vers un webinaire de prise en main. Notre équipe onboarding vous contacte sous 24h pour un accompagnement personnalisé.',
  },
  {
    q: 'Le support est-il inclus ?',
    a: 'Oui, tous les plans incluent notre support technique par email et chat. Les réponses sont garanties sous 24h ouvrées pour les plans Starter, sous 4h pour Business, et sous 1h avec un account manager dédié pour Enterprise.',
  },
  {
    q: 'Puis-je être hébergé chez moi ?',
    a: 'LYRA est disponible en SaaS cloud (hébergement sécurisé en France et Côte d\'Ivoire) et en On-Premise pour les plans Enterprise. Notre infrastructure est certifiée ISO 27001 et conforme RGPD. L\'hébergement On-Premise nécessite un audit technique préalable.',
  },
]

/* ---------- Price format ---------- */
function formatPrice(price: number): string {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/* ---------- Plan Card Component ---------- */
function PlanCard({ plan, yearly, index }: { plan: Plan; yearly: boolean; index: number }) {
  const price = yearly ? plan.yearlyPrice : plan.monthlyPrice
  const period = yearly ? '/an' : '/mois'

  const [waName, setWaName] = useState('')
  const [waEmail, setWaEmail] = useState('')

  function getWhatsAppMessage(name: string, email: string): string {
    const priceStr = formatPrice(price)
    const periodStr = yearly ? '/an' : '/mois'
    const msg = `Bonjour LYRA, je souhaite souscrire au plan ${plan.name} (${priceStr} FCFA${periodStr}). Je paie par Mobile Money. Mon nom: ${name || '[Nom]'}. Mon email: ${email || '[Email]'}`
    return encodeURIComponent(msg)
  }

  function handleWhatsAppClick() {
    const msg = getWhatsAppMessage(waName, waEmail)
    window.open(`https://wa.me/2250585470303?text=${msg}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 40 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={`relative flex flex-col rounded-2xl ${
        plan.popular
          ? 'border-2 border-lyra-gold/60 shadow-[0_0_30px_rgba(201,169,97,0.15)] scale-[1.02] md:scale-105 z-10'
          : 'border border-white/10 hover:border-lyra-gold/30'
      } bg-gradient-to-b ${plan.gradient} backdrop-blur-xl transition-all duration-500`}
      whileHover={
        plan.popular
          ? { y: -6, boxShadow: '0 0 50px rgba(201,169,97,0.25)', transition: { duration: 0.3 } }
          : { y: -4, borderColor: 'rgba(201,169,97,0.4)', boxShadow: '0 0 20px rgba(201,169,97,0.1)', transition: { duration: 0.3 } }
      }
    >
      {/* Popular badge */}
      {plan.popular && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.15 + 0.4, duration: 0.4 }}
          className="absolute -top-4 left-1/2 -translate-x-1/2"
        >
          <span className="inline-flex items-center gap-1.5 bg-lyra-gold text-lyra-dark text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-lyra-gold/30">
            <Star className="w-3.5 h-3.5 fill-current" />
            POPULAIRE
          </span>
        </motion.div>
      )}

      <div className="p-6 md:p-8 flex flex-col h-full">
        {/* Header */}
        <motion.div variants={fadeUpVariants} className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${plan.popular ? 'bg-lyra-gold/20 text-lyra-gold' : 'bg-white/5 text-lyra-cream/70'}`}>
              {plan.icon}
            </div>
            <h3 className="text-xl font-bold font-display text-lyra-cream">{plan.name}</h3>
          </div>
          <p className="text-sm text-lyra-cream/60">{plan.tagline}</p>
        </motion.div>

        {/* Price */}
        <motion.div variants={fadeUpVariants} className="mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={yearly ? 'yearly' : 'monthly'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex items-baseline gap-1"
            >
              <span className="text-4xl md:text-5xl font-bold font-display text-lyra-cream">
                {formatPrice(price)}
              </span>
              <span className="text-lyra-gold font-semibold text-lg">FCFA</span>
              <span className="text-lyra-cream/50 text-sm ml-1">{period}</span>
            </motion.div>
          </AnimatePresence>
          {yearly && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-green-400 mt-1 font-medium"
            >
              ✦ Économisez {formatPrice(plan.monthlyPrice * 12 - plan.yearlyPrice)} FCFA / an
            </motion.p>
          )}
        </motion.div>

        {/* Limits */}
        <motion.div variants={fadeUpVariants} className="flex gap-4 mb-6 pb-6 border-b border-white/5">
          <div className="flex items-center gap-2 text-sm text-lyra-cream/70">
            <Users className="w-4 h-4 text-lyra-gold/60" />
            {plan.maxUsers}
          </div>
          <div className="flex items-center gap-2 text-sm text-lyra-cream/70">
            <Building2 className="w-4 h-4 text-lyra-gold/60" />
            {plan.maxCompanies}
          </div>
        </motion.div>

        {/* Features */}
        <motion.ul variants={staggerContainerVariants} className="space-y-2.5 mb-8 flex-1">
          {plan.features.map((feat, i) => (
            <motion.li
              key={feat.label}
              variants={listItemVariants}
              className="flex items-start gap-3 text-sm"
            >
              {feat.included ? (
                <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
              ) : (
                <X className="w-4 h-4 text-red-400/40 mt-0.5 shrink-0" />
              )}
              <span className={feat.included ? 'text-lyra-cream/85' : 'text-lyra-cream/30'}>
                {feat.label}
              </span>
            </motion.li>
          ))}
        </motion.ul>

        {/* CTA */}
        <motion.div variants={fadeUpVariants} className="mt-auto">
          {plan.enterprise ? (
            <Link href="/contact">
              <ButtonElegant variant="outline" size="lg" className="w-full">
                Contacter les ventes
              </ButtonElegant>
            </Link>
          ) : (
            <Link href={`/signup?plan=${plan.id}&billing=${yearly ? 'yearly' : 'monthly'}`}>
              <ButtonElegant
                variant={plan.popular ? 'primary' : 'secondary'}
                size="lg"
                className="w-full"
              >
                Commencer avec {plan.name}
              </ButtonElegant>
            </Link>
          )}

          {/* WhatsApp Mobile Money */}
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-lyra-cream/40 text-center mb-3">
              Ou payez par Mobile Money directement
            </p>
            <div className="space-y-2 mb-3">
              <input
                type="text"
                placeholder="Votre nom"
                value={waName}
                onChange={(e) => setWaName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-lyra-cream placeholder-lyra-cream/30 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
              />
              <input
                type="email"
                placeholder="Votre email"
                value={waEmail}
                onChange={(e) => setWaEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-lyra-cream placeholder-lyra-cream/30 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-all"
              />
            </div>
            <ButtonElegant
              variant="secondary"
              size="lg"
              className="w-full !bg-green-600/20 !border-green-500/40 !text-green-400 hover:!bg-green-600/30 hover:!border-green-500/60"
              onClick={handleWhatsAppClick}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Payer par Mobile Money
            </ButtonElegant>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ---------- Toggle Component ---------- */
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
      <AnimatePresence>
        {yearly && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8, x: -4 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -4 }}
            className="text-xs bg-green-500/15 text-green-400 px-2.5 py-1 rounded-full font-medium border border-green-500/20"
          >
            -2 mois offerts
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---------- FAQ Component ---------- */
function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="max-w-3xl mx-auto">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-2xl md:text-3xl font-bold font-display text-center text-lyra-cream mb-12"
      >
        Questions fréquentes
      </motion.h2>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-lyra-cream/80 hover:text-lyra-cream transition-colors"
              >
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-lyra-gold/50 shrink-0" />
                  {faq.q}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="shrink-0"
                >
                  <ChevronDown className="w-4 h-4 text-lyra-gold/50" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="faq-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-lyra-cream/60 leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

/* ---------- Main Page ---------- */
export default function PricingPage() {
  const [yearly, setYearly] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)

  return (
    <PageTransition>
      <main className="min-h-screen bg-lyra-dark">
        {/* Bandeau défilant en haut */}
        <ScrollingBanner />

        {/* Subtle background decoration */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lyra-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-lyra-steel/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-lyra-cream/50 hover:text-lyra-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour à l&apos;accueil
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-lyra-cream mb-4">
              Choisissez votre plan{' '}
              <span className="bg-gradient-to-r from-lyra-gold to-lyra-goldlight bg-clip-text text-transparent">
                LYRA
              </span>
            </h1>
            <p className="text-lg text-lyra-cream/60 max-w-2xl mx-auto">
              Des formules adaptées à toutes les tailles d&apos;entreprise. Évoluez à votre rythme, sans engagement.
            </p>
          </motion.div>

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-12"
          >
            <BillingToggle yearly={yearly} setYearly={setYearly} />
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-6 items-start mb-16 md:mb-24">
            {plans.map((plan, i) => (
              <PlanCard key={plan.id} plan={plan} yearly={yearly} index={i} />
            ))}
          </div>

          {/* Compare Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 md:mb-24"
          >
            <button
              onClick={() => setCompareOpen(!compareOpen)}
              className="mx-auto flex items-center gap-2 text-sm text-lyra-gold/70 hover:text-lyra-gold transition-colors"
            >
              <Info className="w-4 h-4" />
              Comparer toutes les fonctionnalités
              <motion.div animate={{ rotate: compareOpen ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {compareOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden mt-6"
                >
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left px-4 py-3.5 text-lyra-cream/50 font-medium">Fonctionnalité</th>
                          {plans.map((p) => (
                            <th
                              key={p.id}
                              className={`px-4 py-3.5 text-center font-medium ${
                                p.popular ? 'text-lyra-gold' : 'text-lyra-cream/50'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1.5">
                                {p.popular && <Star className="w-3.5 h-3.5 fill-lyra-gold" />}
                                {p.name}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {plans[0].features.map((feat) => (
                          <tr key={feat.label} className="border-b border-white/[0.03] last:border-0">
                            <td className="px-4 py-3 text-lyra-cream/70">{feat.label}</td>
                            {plans.map((p) => {
                              const f = p.features.find((ff) => ff.label === feat.label)
                              return (
                                <td key={p.id} className="px-4 py-3 text-center">
                                  {f?.included ? (
                                    <Check className="w-4 h-4 text-green-400 mx-auto" />
                                  ) : (
                                    <X className="w-4 h-4 text-red-400/30 mx-auto" />
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                        {/* Extra rows: Limits */}
                        <tr className="border-t border-white/5">
                          <td className="px-4 py-3 text-lyra-cream/70">Utilisateurs</td>
                          {plans.map((p) => (
                            <td key={p.id} className="px-4 py-3 text-center text-lyra-cream/60 text-xs">
                              {p.maxUsers}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-lyra-cream/70">Sociétés</td>
                          {plans.map((p) => (
                            <td key={p.id} className="px-4 py-3 text-center text-lyra-cream/60 text-xs">
                              {p.maxCompanies}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Bottom CTA */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16 md:mb-24"
          >
            <div className="max-w-2xl mx-auto p-8 md:p-12 rounded-2xl border border-lyra-gold/20 bg-gradient-to-b from-lyra-gold/5 to-transparent backdrop-blur-sm">
              <h2 className="text-2xl md:text-3xl font-bold font-display text-lyra-cream mb-3">
                Prêt à démarrer ?
              </h2>
              <p className="text-lyra-cream/60 mb-8 max-w-md mx-auto">
                Rejoignez les entreprises qui font confiance à LYRA pour leur gestion d&apos;entreprise. Essayez gratuitement pendant 14 jours.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/signup">
                  <ButtonElegant variant="primary" size="lg">
                    Commencer l&apos;essai gratuit
                  </ButtonElegant>
                </Link>
                <Link href="/contact">
                  <ButtonElegant variant="outline" size="lg">
                    Demander une démo
                  </ButtonElegant>
                </Link>
              </div>
              <p className="text-xs text-lyra-cream/30 mt-4">Sans carte bancaire • Annulation à tout moment</p>
            </div>
          </motion.section>

          {/* FAQ */}
          <FAQSection />

          {/* Proverbe après la FAQ */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-12"
          >
            <ProverbDisplay page="pricing" />
          </motion.div>
        </div>
      </main>
    </PageTransition>
  )
}
