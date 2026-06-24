'use client'

import { motion } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { ArrowRight, Sparkles } from 'lucide-react'
import GlowButton from '../ui/GlowButton'
import TiltCard from '../ui/TiltCard'

/* ──────────────────────────────────────────────────────────────────────────────
   Animated background blobs / blobs animés
   ────────────────────────────────────────────────────────────────────────────── */
function BackgroundBlobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Légère surbrillance dorée */}
      <div className="absolute inset-0 bg-gradient-to-b from-lyra-navy/60 via-lyra-dark to-lyra-dark" />

      {/* Particules subtiles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-lyra-gold/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0, 1.5, 0],
            y: [0, -30],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Mockup Dashboard — simulation visuelle d'une interface ERP
   ────────────────────────────────────────────────────────────────────────────── */
function DashboardMockup() {
  return (
    <motion.div
      className="relative w-full max-w-3xl mx-auto mt-12 md:mt-16"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Conteneur mockup */}
      <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/50">
        {/* Barre supérieure */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/50" />
          </div>
          <div className="ml-4 flex items-center gap-3 text-[10px] text-white/30 uppercase tracking-wider">
            <span className="text-lyra-gold/60 font-medium">LYRA</span>
            <span className="w-px h-3 bg-white/10" />
            <span>Tableau de bord</span>
            <span className="w-px h-3 bg-white/10" />
            <span>Comptabilité</span>
          </div>
        </div>

        {/* Contenu simulé */}
        <div className="p-5 md:p-7 grid grid-cols-3 gap-3">
          {/* Carte 1 — Chiffre d'affaires */}
          <div className="col-span-2 rounded-xl bg-white/[0.03] border border-white/5 p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] uppercase tracking-wider text-white/30">Chiffre d&apos;affaires</span>
              <span className="text-[10px] text-green-400/70 font-medium">+12.4%</span>
            </div>
            <div className="text-xl md:text-2xl font-bold text-lyra-cream">12 450 000 <span className="text-xs font-normal text-lyra-gold/60">FCFA</span></div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1 mt-3 h-10">
              {[40, 55, 45, 70, 60, 85, 75].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-lyra-gold/30 to-lyra-gold/10"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Carte 2 — Conformité */}
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 flex flex-col items-center justify-center">
            <div className="text-2xl md:text-3xl font-bold text-green-400">99.9%</div>
            <div className="text-[10px] uppercase tracking-wider text-white/30 mt-1 text-center">Conformité SYSCOHADA</div>
          </div>

          {/* Carte 3 — Dernières transactions */}
          <div className="rounded-xl bg-white/[0.03] border border-white/5 p-4 col-span-2">
            <span className="text-[10px] uppercase tracking-wider text-white/30 mb-2 block">Dernières opérations</span>
            <div className="space-y-2">
              {[
                { label: 'Facture #FAC-2026-0421', value: '+ 850 000', color: 'text-green-400' },
                { label: 'Déclaration TVA mars', value: '- 195 000', color: 'text-red-400' },
                { label: 'Paie mars 2026', value: '- 2 450 000', color: 'text-red-400' },
              ].map((tx, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="text-white/50">{tx.label}</span>
                  <span className={`font-medium ${tx.color}`}>{tx.value} FCFA</span>
                </div>
              ))}
            </div>
          </div>

          {/* Carte 4 — Chat IA */}
          <div className="rounded-xl bg-gradient-to-br from-lyra-gold/[0.05] to-transparent border border-lyra-gold/10 p-4 flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-lyra-gold/10 flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4 text-lyra-gold" />
            </div>
            <div className="text-[10px] uppercase tracking-wider text-lyra-gold/60 text-center">Chat OHADA</div>
            <div className="text-[9px] text-white/30 text-center mt-1">Assistance IA en ligne</div>
          </div>
        </div>
      </div>

      {/* Glow sous le mockup */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-20 bg-gradient-to-r from-transparent via-lyra-gold/10 to-transparent blur-3xl rounded-full" />
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Hero Section — Full-screen premium landing hero
   ────────────────────────────────────────────────────────────────────────────── */
export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null)

  const titleWords = ['LYRA', 'by', 'Vivalys']

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      <BackgroundBlobs />

      {/* Ligne décorative supérieure */}
      <motion.div
        className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-lyra-gold/20 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto pt-24 md:pt-0">
        {/* Logo Coris */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Image
            src="/img/coris.png"
            alt="Coris"
            width={200}
            height={85}
            className="object-contain"
            priority
          />
        </motion.div>

        {/* Titre principal */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.9] mb-4">
          {titleWords.map((word, i) => (
            <motion.span
              key={word}
              className={
                word === 'LYRA'
                  ? 'text-lyra-gold'
                  : word === 'by'
                  ? 'text-white/30 text-2xl sm:text-3xl md:text-5xl font-normal mx-2 align-middle'
                  : 'text-lyra-cream'
              }
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.4 + i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word}{' '}
            </motion.span>
          ))}
        </h1>

        {/* Sous-titre */}
        <motion.p
          className="text-base sm:text-lg md:text-xl text-lyra-gold/70 font-light tracking-wide mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          L&apos;ERP OHADA nouvelle génération
        </motion.p>

        {/* Description */}
        <motion.p
          className="text-sm sm:text-base text-white/50 max-w-2xl leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1 }}
        >
          Gérez votre comptabilité, vos stocks, votre paie et votre fiscalité —
          conformément au SYSCOHADA — depuis une plateforme unique, moderne et
          ivoirienne.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2 }}
        >
          <GlowButton href="/signup" variant="primary" className="px-8 py-4 text-lg">
              Commencer gratuitement
              <ArrowRight className="ml-2 w-4 h-4" />
            </GlowButton>
          <GlowButton href="#pricing" variant="outline" className="px-8 py-4 text-lg">
              Voir les offres
            </GlowButton>
        </motion.div>

        {/* Dashboard Mockup avec effet 3D tilt */}
        <TiltCard tiltMax={6} glowColor="rgba(212,175,55,0.1)">
          <DashboardMockup />
        </TiltCard>
      </div>
    </section>
  )
}
