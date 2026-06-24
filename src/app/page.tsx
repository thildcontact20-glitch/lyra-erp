'use client'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Shield, BarChart3, Globe, MessageSquare, Sparkles, ChevronDown } from 'lucide-react'
import { fadeUpVariants, fadeInVariants, staggerContainerVariants, scaleInVariants, slideInLeftVariants, slideInRightVariants } from '../lib/framerVariants'
import StaggerContainer from '../components/animations/StaggerContainer'
import ButtonElegant from '../components/ui/ButtonElegant'
import CardFinance from '../components/ui/CardFinance'

/* ──────────────────────────────────────────────────────────────────────────────
   Wax Pattern SVG — subtle West African wax print motifs
   ────────────────────────────────────────────────────────────────────────────── */
function WaxPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" opacity={0.06}>
      <defs>
        <pattern id="wax-diamond" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <rect width="80" height="80" fill="none" />
          <path d="M40 0L80 40L40 80L0 40Z" fill="none" stroke="#C9A961" strokeWidth="0.8" opacity="0.5" />
          <circle cx="40" cy="40" r="6" fill="#C9A961" opacity="0.3" />
        </pattern>
        <pattern id="wax-wave" x="0" y="0" width="120" height="60" patternUnits="userSpaceOnUse">
          <rect width="120" height="60" fill="none" />
          <path d="M0 30 Q30 0 60 30 Q90 60 120 30" fill="none" stroke="#F5F5F0" strokeWidth="0.6" opacity="0.4" />
          <path d="M0 45 Q30 15 60 45 Q90 75 120 45" fill="none" stroke="#4A6FA5" strokeWidth="0.4" opacity="0.3" />
        </pattern>
        <pattern id="wax-circle" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
          <rect width="60" height="60" fill="none" />
          <circle cx="30" cy="30" r="10" fill="none" stroke="#C9A961" strokeWidth="0.6" opacity="0.4" />
          <circle cx="0" cy="0" r="6" fill="none" stroke="#4A6FA5" strokeWidth="0.4" opacity="0.3" />
          <circle cx="60" cy="60" r="6" fill="none" stroke="#4A6FA5" strokeWidth="0.4" opacity="0.3" />
        </pattern>
      </defs>
      <rect x="0" y="0" width="100%" height="100%" fill="url(#wax-diamond)" />
      <rect x="0" y="0" width="100%" height="100%" fill="url(#wax-wave)" />
      <rect x="0" y="0" width="100%" height="100%" fill="url(#wax-circle)" />
    </svg>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Ivory Coast Coat of Arms SVG — stylised
   ────────────────────────────────────────────────────────────────────────────── */
function IvoryCoastCoatOfArms() {
  return (
    <svg viewBox="0 0 240 300" className="w-36 h-44 md:w-44 md:h-52 drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C9A961" stopOpacity={0.3} />
          <stop offset="100%" stopColor="#C9A961" stopOpacity={0.05} />
        </linearGradient>
        <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A961" stopOpacity={1} />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity={0.7} />
        </linearGradient>
      </defs>
      <path d="M120 20 L200 60 L200 150 Q200 220 120 270 Q40 220 40 150 L40 60 Z" fill="url(#shieldGrad)" stroke="#C9A961" strokeWidth="2" opacity={0.9} />
      <path d="M120 35 L185 68 L185 145 Q185 205 120 250 Q55 205 55 145 L55 68 Z" fill="none" stroke="rgba(201,169,97,0.3)" strokeWidth="0.8" />
      <circle cx="120" cy="105" r="25" fill="url(#sunGrad)" opacity={0.9} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line key={angle} x1={120 + Math.cos((angle * Math.PI) / 180) * 28} y1={105 + Math.sin((angle * Math.PI) / 180) * 28} x2={120 + Math.cos((angle * Math.PI) / 180) * 38} y2={105 + Math.sin((angle * Math.PI) / 180) * 38} stroke="#C9A961" strokeWidth="1.5" opacity={0.6} />
      ))}
      <g transform="translate(120, 180)">
        <ellipse cx="0" cy="0" rx="28" ry="18" fill="#8B7355" opacity={0.8} />
        <circle cx="-20" cy="-12" r="14" fill="#8B7355" opacity={0.85} />
        <path d="M-32 -8 Q-42 2 -38 18 Q-36 26 -30 22" fill="none" stroke="#8B7355" strokeWidth="4" strokeLinecap="round" opacity={0.8} />
        <ellipse cx="-10" cy="-14" rx="8" ry="10" fill="#6B5B45" opacity={0.5} />
        <circle cx="-24" cy="-14" r="2.5" fill="#040810" opacity={0.8} />
        <path d="M-30 -4 Q-28 6 -24 8" fill="none" stroke="#F5F5F0" strokeWidth="1.5" strokeLinecap="round" opacity={0.7} />
        <rect x="-10" y="12" width="5" height="14" rx="2" fill="#7A6848" opacity={0.7} />
        <rect x="5" y="12" width="5" height="14" rx="2" fill="#7A6848" opacity={0.7} />
        <path d="M26 0 Q34 -4 32 -10" fill="none" stroke="#7A6848" strokeWidth="1.5" strokeLinecap="round" opacity={0.5} />
      </g>
      <rect x="40" y="262" width="160" height="18" rx="3" fill="rgba(201,169,97,0.15)" stroke="#C9A961" strokeWidth="0.8" opacity={0.7} />
      <text x="120" y="275" textAnchor="middle" fill="#C9A961" fontSize="8" fontFamily="Inter, sans-serif" fontWeight="600" letterSpacing="1.5" opacity={0.85}>RÉPUBLIQUE DE CÔTE D'IVOIRE</text>
    </svg>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Hero Section — full-screen with parallax, glowing orbs, wax background
   ────────────────────────────────────────────────────────────────────────────── */
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0.3])
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.92])

  const titleWords = ['LYRA', 'by', 'Vivalys']

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-lyra-navy/80 via-lyra-dark to-lyra-dark" />
      <div className="absolute inset-0"><WaxPattern /></div>

      {/* Glowing orbs */}
      <motion.div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-lyra-gold/5 blur-[120px]" animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-lyra-steel/5 blur-[100px]" animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />

      {/* Decorative top line */}
      <motion.div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-lyra-gold/30 to-transparent" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} transition={{ duration: 1.5, delay: 0.5 }} />

      <motion.div style={{ y: heroY, opacity: heroOpacity, scale: heroScale }} className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        {/* Top badge */}
        <motion.div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-lyra-gold/20 bg-lyra-gold/5 text-lyra-gold text-xs tracking-[0.2em] uppercase" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <Sparkles className="w-3 h-3" />
          ERP financier nouvelle génération
        </motion.div>

        {/* Animated title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.9] mb-4">
          {titleWords.map((word, i) => (
            <motion.span key={word} className={word === 'LYRA' ? 'text-lyra-gold' : word === 'by' ? 'text-white/40 text-3xl sm:text-4xl md:text-5xl font-normal mx-2 align-middle' : 'text-lyra-cream'} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}>{word}{' '}</motion.span>
          ))}
        </h1>

        {/* Subtitle */}
        <motion.p className="text-lg sm:text-xl md:text-2xl text-lyra-gold/80 font-light tracking-wide mb-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.8 }}>L&apos;ERP financier des PME OHADA</motion.p>

        {/* Description */}
        <motion.p className="text-sm sm:text-base text-white/50 max-w-xl leading-relaxed mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 1 }}>
          Conçu en Côte d&apos;Ivoire, LYRA réconcilie la puissance de la finance de marché avec la rigueur des normes SYSCOHADA — comptabilité, fiscalité, paie et pilotage en temps réel.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div className="flex flex-col sm:flex-row gap-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.2 }}>
          <Link href="/login"><ButtonElegant variant="primary" size="lg">Se connecter<ArrowRight className="ml-2 w-4 h-4" /></ButtonElegant></Link>
          <Link href="/signup"><ButtonElegant variant="outline" size="lg">Créer un compte</ButtonElegant></Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown className="w-5 h-5 text-lyra-gold/40" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Value Propositions — 4 animated cards
   ────────────────────────────────────────────────────────────────────────────── */
function ValuePropsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const cards = [
    { icon: Shield, title: 'Comptabilité conforme', subtitle: 'OHADA / SYSCOHADA', desc: 'Tenez votre comptabilité aux normes SYSCOHADA révisées. Journaux, balances, états financiers certifiables générés automatiquement.', color: 'from-amber-500/20 to-amber-600/5' },
    { icon: BarChart3, title: 'Fiscalité ivoirienne', subtitle: 'DGI & CNPS', desc: 'Déclarations fiscales pré-remplies, TVA, Impôt Minimum Forfaitaire, cotisations CNPS calculées en temps réel.', color: 'from-blue-500/20 to-blue-600/5' },
    { icon: Globe, title: 'Pilotage en temps réel', subtitle: 'Tableaux de bord', desc: 'Cash-flow, trésorerie, ratios financiers — suivez votre santé financière à la minute, où que vous soyez.', color: 'from-emerald-500/20 to-emerald-600/5' },
    { icon: MessageSquare, title: 'IA conversationnelle', subtitle: 'Assistance intelligente', desc: 'Posez vos questions en langage naturel. Notre IA spécialisée OHADA vous répond avec précision et références réglementaires.', color: 'from-purple-500/20 to-purple-600/5' },
  ]

  return (
    <section ref={ref} className="relative py-28 md:py-36 overflow-hidden">
      <div className="absolute inset-0"><WaxPattern /></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lyra-gold/20 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <motion.span className="inline-block text-lyra-gold text-xs tracking-[0.25em] uppercase mb-3" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.2 }}>{'━'} Pourquoi LYRA {'━'}</motion.span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-lyra-cream mb-4">La finance d&apos;entreprise<br /><span className="text-lyra-gold">repensée pour l&apos;Afrique</span></h2>
          <p className="text-white/40 max-w-xl mx-auto text-sm md:text-base">Quatre piliers pour transformer votre gestion financière</p>
        </motion.div>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" variants={staggerContainerVariants} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
          {cards.map((card) => (
            <motion.div key={card.title} variants={fadeUpVariants} className="group">
              <CardFinance className="p-6 md:p-7 h-full flex flex-col">
                <div className={'w-12 h-12 rounded-xl bg-gradient-to-br ' + card.color + ' border border-lyra-gold/10 flex items-center justify-center mb-5 group-hover:border-lyra-gold/30 transition-all duration-500'}>
                  <card.icon className="w-5 h-5 text-lyra-gold" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-lyra-gold/60 mb-2">{card.subtitle}</span>
                <h3 className="text-lg font-display font-semibold text-lyra-cream mb-2 group-hover:text-lyra-gold transition-colors duration-300">{card.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed flex-1">{card.desc}</p>
                <motion.div className="mt-4 h-px w-0 bg-gradient-to-r from-lyra-gold/40 to-transparent group-hover:w-full transition-all duration-500" />
              </CardFinance>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Identity Section — Coat of Arms, tagline, wax motifs
   ────────────────────────────────────────────────────────────────────────────── */
function IdentitySection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative py-28 md:py-36 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-lyra-dark via-lyra-navy/60 to-lyra-dark" />
      <div className="absolute inset-0"><WaxPattern /></div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lyra-gold/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lyra-gold/15 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <motion.div className="flex flex-col items-center gap-8" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 1 }}>
          <motion.div initial={{ opacity: 0, scale: 0.8, rotateY: -15 }} animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : {}} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <IvoryCoastCoatOfArms />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.3 }}>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-lyra-cream mb-4">Conçu en <span className="text-lyra-gold">Côte d&apos;Ivoire</span>,<br />pour les PME <span className="text-lyra-gold">africaines</span></h2>
            <div className="w-16 h-0.5 bg-lyra-gold/40 mx-auto my-6" />
            <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              LYRA incarne l&apos;excellence financière ivoirienne. Né à Abidjan, notre ERP conjugue la rigueur des places financières internationales avec une connaissance intime des réalités des PME de l&apos;espace OHADA — de la TVA aux déclarations CNPS, de la facture électronique au reporting bancaire.
            </p>
          </motion.div>

          <motion.div className="grid grid-cols-3 gap-8 md:gap-16 mt-8" variants={staggerContainerVariants} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
            {[
              { value: '17', label: 'Pays OHADA' },
              { value: '99.9%', label: 'Conformité' },
              { value: '24/7', label: 'Support IA' },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUpVariants} className="text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-lyra-gold mb-1">{stat.value}</div>
                <div className="text-xs uppercase tracking-[0.15em] text-white/30">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Auth Section — bottom CTA with parallax
   ────────────────────────────────────────────────────────────────────────────── */
function AuthSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const bgY = useTransform(scrollYProgress, [0, 1], [60, -60])
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-28 md:py-36 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div className="absolute inset-0 bg-gradient-to-b from-lyra-dark via-lyra-navy/40 to-lyra-dark" />
        <WaxPattern />
      </motion.div>

      <motion.div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-lyra-gold/3 blur-[150px]" animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        <motion.span className="text-lyra-gold/50 text-xs tracking-[0.25em] uppercase mb-6 block" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ duration: 0.6 }}>Prêt à transformer votre gestion ?</motion.span>

        <motion.h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-lyra-cream mb-4" variants={fadeUpVariants} initial="hidden" animate={isInView ? 'visible' : 'hidden'}>Rejoignez <span className="text-lyra-gold">LYRA</span></motion.h2>

        <motion.p className="text-white/40 mb-10 text-sm md:text-base max-w-md mx-auto" variants={fadeUpVariants} initial="hidden" animate={isInView ? 'visible' : 'hidden'} transition={{ delay: 0.1 }}>Première année offerte pour les PME ivoiriennes agréées. Accompagnement personnalisé à la migration.</motion.p>

        <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" variants={fadeUpVariants} initial="hidden" animate={isInView ? 'visible' : 'hidden'} transition={{ delay: 0.2 }}>
          <Link href="/login"><ButtonElegant variant="primary" size="lg">Se connecter<ArrowRight className="ml-2 w-4 h-4" /></ButtonElegant></Link>
          <Link href="/signup"><ButtonElegant variant="secondary" size="lg">Créer un compte gratuit</ButtonElegant></Link>
        </motion.div>

        <motion.p className="text-white/20 text-xs mt-8" initial={{ opacity: 0 }} animate={isInView ? { opacity: 1 } : {}} transition={{ delay: 0.6, duration: 0.6 }}>Sans engagement · Migration assistée · Données chiffrées de bout en bout</motion.p>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Footer
   ────────────────────────────────────────────────────────────────────────────── */
function FooterSection() {
  return (
    <footer className="relative border-t border-white/5 py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-white/20 text-xs">&copy; {new Date().getFullYear()} LYRA by Vivalys — Tous droits réservés</p>
        <div className="flex items-center gap-6">
          <span className="text-white/20 text-xs">Conformité SYSCOHADA</span>
          <span className="w-1 h-1 rounded-full bg-lyra-gold/20" />
          <span className="text-white/20 text-xs">Certifié DGI</span>
          <span className="w-1 h-1 rounded-full bg-lyra-gold/20" />
          <span className="text-white/20 text-xs">Sécurité AES-256</span>
        </div>
      </div>
    </footer>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Page Composition
   ────────────────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <main className="relative min-h-screen bg-lyra-dark">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" aria-hidden="true"><WaxPattern /></div>
      <div className="relative z-10">
        <HeroSection />
        <ValuePropsSection />
        <IdentitySection />
        <AuthSection />
        <FooterSection />
      </div>
    </main>
  )
}
