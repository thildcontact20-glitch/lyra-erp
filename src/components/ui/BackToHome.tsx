'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BackToHome({ href = '/' }: { href?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="absolute top-6 left-6 z-20"
    >
      <Link
        href={href}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-lyra-cream/40 hover:text-lyra-gold hover:bg-white/5 transition-all duration-300 text-sm group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
        <span>Accueil</span>
      </Link>
    </motion.div>
  )
}
