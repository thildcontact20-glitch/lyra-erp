'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Building2, Calendar, Users, Package, FileText, BookOpen,
  BarChart3, UserPlus, DollarSign, MessageSquare, Sparkles,
  ChevronRight, ArrowRight,
} from 'lucide-react'
import { fadeUpVariants } from '../../lib/framerVariants'
import AppShell from '../../components/layout/AppShell'
import PageTransition from '../../components/animations/PageTransition'
import StaggerContainer from '../../components/animations/StaggerContainer'
import CardFinance from '../../components/ui/CardFinance'
import ButtonElegant from '../../components/ui/ButtonElegant'
import ProverbDisplay from '../../components/ambiance/ProverbDisplay'

/* ───────────────────────────────────────────────────────────────
   Step data
   ─────────────────────────────────────────────────────────────── */
interface StepData {
  number: number
  title: string
  description: string
  href: string
  icon: React.ElementType
}

const STEPS: StepData[] = [
  {
    number: 1,
    title: 'Créez votre société',
    description: 'Configurez les informations légales et fiscales de votre entreprise dans LYRA.',
    href: '/login',
    icon: Building2,
  },
  {
    number: 2,
    title: 'Configurez votre exercice',
    description: "Définissez l'exercice comptable et les paramètres LYRA de votre société.",
    href: '/compta',
    icon: Calendar,
  },
  {
    number: 3,
    title: 'Créez votre premier client',
    description: 'Ajoutez vos clients dans le module commercial pour commencer à facturer.',
    href: '/commercial',
    icon: Users,
  },
  {
    number: 4,
    title: 'Créez votre premier article',
    description: 'Renseignez vos produits et services dans la gestion des stocks.',
    href: '/stocks',
    icon: Package,
  },
  {
    number: 5,
    title: 'Saisissez votre première facture',
    description: 'Émettez une facture client depuis le module commercial.',
    href: '/commercial',
    icon: FileText,
  },
  {
    number: 6,
    title: 'Saisissez votre première écriture comptable',
    description: "Enregistrez une opération dans le journal comptable LYRA.",
    href: '/compta',
    icon: BookOpen,
  },
  {
    number: 7,
    title: 'Générez votre premier bilan',
    description: 'Produisez les états financiers : bilan, compte de résultat et annexes.',
    href: '/etats',
    icon: BarChart3,
  },
  {
    number: 8,
    title: 'Créez votre premier employé',
    description: "Ajoutez un employé dans le module paie pour générer ses fiches.",
    href: '/paie',
    icon: UserPlus,
  },
  {
    number: 9,
    title: 'Générez un bulletin de paie',
    description: 'Calculez et éditez un bulletin de paie conforme à la législation ivoirienne.',
    href: '/paie',
    icon: DollarSign,
  },
  {
    number: 10,
    title: 'Explorez le Chat LYRA',
    description: 'Posez toutes vos questions sur la comptabilité LYRA à notre assistant intelligent.',
    href: '/chat-ohada',
    icon: MessageSquare,
  },
]

/* ───────────────────────────────────────────────────────────────
   StepCard — individual step with gold badge
   ─────────────────────────────────────────────────────────────── */
function StepCard({ step, index }: { step: StepData; index: number }) {
  const Icon = step.icon
  return (
    <motion.div
      variants={fadeUpVariants}
      className="w-full"
    >
      <CardFinance className="p-5 h-full flex flex-col gap-3 relative overflow-hidden group">
        {/* Gold accent corner glow */}
        <motion.div
          className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-[0.04] group-hover:opacity-[0.1] transition-opacity duration-500"
          style={{
            background: 'radial-gradient(circle, rgba(201,169,97,0.6), transparent)',
          }}
        />

        {/* Header: number badge + icon */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Number badge */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lyra-gold/20 to-amber-600/10 border border-lyra-gold/30 flex items-center justify-center">
                <span className="text-sm font-bold font-display text-lyra-gold">{step.number}</span>
              </div>
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-lyra-gold/20 to-transparent" />
              )}
            </div>
            <div className="w-9 h-9 rounded-lg bg-lyra-gold/10 border border-lyra-gold/15 flex items-center justify-center flex-shrink-0 group-hover:bg-lyra-gold/20 transition-colors">
              <Icon className="w-4 h-4 text-lyra-gold" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-semibold text-lyra-cream group-hover:text-lyra-gold transition-colors">
            {step.title}
          </h3>
          <p className="text-xs text-white/40 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Link */}
        <Link
          href={step.href}
          className="inline-flex items-center gap-1.5 text-xs text-lyra-gold/60 hover:text-lyra-gold transition-colors mt-auto pt-2 border-t border-white/5 group/link"
        >
          <span>→ Aller vers {step.href}</span>
          <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </CardFinance>
    </motion.div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Getting Started Page
   ─────────────────────────────────────────────────────────────── */
export default function GettingStartedPage() {
  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-10 pb-10">
          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            {/* Premium badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full border border-lyra-gold/20 bg-lyra-gold/5 text-lyra-gold text-[10px] tracking-[0.2em] uppercase"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Sparkles className="w-3 h-3" />
              Guide de démarrage
            </motion.div>

            <motion.h1
              className="text-2xl md:text-3xl font-display font-bold text-lyra-cream"
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              Bienvenue dans LYRA by Vivalys
            </motion.h1>
            <motion.p
              className="text-white/40 text-sm mt-2 max-w-xl mx-auto"
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.1 }}
            >
              Suivez ces 10 étapes pour configurer votre ERP et démarrer votre comptabilité
              LYRA en toute sérénité.
            </motion.p>

            {/* Proverbe d'accueil */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="mt-4"
            >
              <ProverbDisplay page="onboarding" />
            </motion.div>
          </motion.div>

          {/* ── Progress indicator ── */}
          <motion.div
            className="flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div
                key={n}
                className="w-2 h-2 rounded-full bg-lyra-gold/20 border border-lyra-gold/10"
              />
            ))}
            <span className="text-[10px] text-white/30 ml-2 tracking-[0.1em] uppercase">
              10 étapes
            </span>
          </motion.div>

          {/* ── Steps Grid (2x5 on lg, 1 column on mobile) ── */}
          <StaggerContainer>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {STEPS.map((step, i) => (
                <StepCard key={step.number} step={step} index={i} />
              ))}
            </div>
          </StaggerContainer>

          {/* ── CTA Buttons ── */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link href="/dashboard">
              <ButtonElegant variant="primary" size="lg">
                <span className="flex items-center gap-2">
                  Accéder au Dashboard
                  <ArrowRight className="w-4 h-4" />
                </span>
              </ButtonElegant>
            </Link>
            <Link href="/pricing">
              <ButtonElegant variant="outline" size="lg">
                <span className="flex items-center gap-2">
                  Voir les offres
                </span>
              </ButtonElegant>
            </Link>
          </motion.div>

          {/* ── Footer ── */}
          <motion.p
            className="text-[10px] text-white/20 text-center pt-6 border-t border-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Chaque étape vous rapproche d&apos;une gestion financière maîtrisée et conforme
          </motion.p>
        </div>
      </PageTransition>
    </AppShell>
  )
}
