'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

/* ──────────────────────────────────────────────────────────────────────────────
   Animated Counter — compte de 0 jusqu'à la valeur cible
   ────────────────────────────────────────────────────────────────────────────── */
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  return (
    <motion.span
      className="text-3xl md:text-4xl lg:text-5xl font-bold font-display text-lyra-gold"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {value}
      {suffix}
    </motion.span>
  )
}

/* ──────────────────────────────────────────────────────────────────────────────
   Stats Data
   ────────────────────────────────────────────────────────────────────────────── */
const stats = [
  { value: '17', label: 'Pays OHADA', description: 'Couverture juridique' },
  { value: '99.9%', label: 'Conformité', description: 'Normes SYSCOHADA' },
  { value: '24/7', label: 'Support IA', description: 'Assistance permanente' },
  { value: '+50', label: 'PME', description: 'Entreprises clientes' },
]

/* ──────────────────────────────────────────────────────────────────────────────
   Stats Section
   ────────────────────────────────────────────────────────────────────────────── */
export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-20 md:py-28 overflow-hidden">
      {/* Ligne séparatrice */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lyra-gold/15 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-lyra-gold/15 to-transparent" />

      <div className="relative z-10 max-w-5xl mx-auto px-4">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {/* Valeur animée */}
              <AnimatedCounter value={stat.value} />

              {/* Label */}
              <div className="text-sm font-medium text-lyra-cream/80 mt-2">{stat.label}</div>

              {/* Description */}
              <div className="text-[10px] uppercase tracking-wider text-white/30 mt-1">
                {stat.description}
              </div>

              {/* Barre décorative (sauf dernier) */}
              {i < stats.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 h-12 w-px bg-gradient-to-b from-transparent via-lyra-gold/20 to-transparent" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
