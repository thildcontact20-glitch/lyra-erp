'use client'
import { motion } from 'framer-motion'

interface Props {
  page: 'home' | 'dashboard' | 'onboarding' | 'pricing'
  className?: string
}

const PROVERBS: Record<string, string> = {
  home: '« Celui qui marche avec sagesse arrive loin. » — Proverbe africain',
  dashboard: '« La meilleure façon de prévoir l’avenir, c’est de le construire. » — Sagesse africaine',
  onboarding: '« Un long voyage commence toujours par un premier pas. » — Proverbe africain',
  pricing: '« Qui plante un arbre aujourd’hui récoltera ses fruits demain. » — Proverbe africain',
}

export default function ProverbDisplay({ page, className = '' }: Props) {
  const text = PROVERBS[page] || PROVERBS.home

  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`text-xs md:text-sm text-lyra-cream/40 italic leading-relaxed tracking-wide ${className}`}
      role="status"
      aria-label="Proverbe du jour"
    >
      {text}
    </motion.p>
  )
}
