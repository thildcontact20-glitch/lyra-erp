'use client'
import { useEffect, useState, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  messages?: string[]
  speed?: number // secondes pour traverser l'écran
  className?: string
}

const DEFAULT_MESSAGES = [
  '✨ LYRA — L\'ERP qui fait grandir votre entreprise',
  '📱 Paiement par Mobile Money accepté — Orange Money, MTN, Moov',
  '🚀 Activez votre plan en 5 minutes — Démo gratuite disponible',
  '🏆 +50 PME ivoiriennes nous font déjà confiance',
]

export default function ScrollingBanner({
  messages = DEFAULT_MESSAGES,
  speed = 35,
  className = '',
}: Props) {
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    if (prefersReducedMotion) return
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % messages.length)
    }, speed * 1000)
    return () => clearInterval(intervalRef.current)
  }, [messages.length, speed, prefersReducedMotion])

  if (prefersReducedMotion) {
    return (
      <div className={`relative w-full overflow-hidden bg-lyra-dark/80 backdrop-blur-sm border-b border-white/5 ${className}`}>
        <div className="max-w-7xl mx-auto px-4 py-2 text-center">
          <p className="text-xs text-lyra-cream/50 tracking-wide">
            {messages[0]}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative w-full overflow-hidden bg-lyra-dark/80 backdrop-blur-sm border-b border-white/5 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-2 text-center">
        <motion.p
          key={activeIndex}
          initial={{ opacity: 0, y: 8, filter: 'blur(2px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(2px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs text-lyra-cream/50 tracking-wide"
          role="marquee"
          aria-live="polite"
        >
          {messages[activeIndex]}
        </motion.p>
      </div>
    </div>
  )
}
