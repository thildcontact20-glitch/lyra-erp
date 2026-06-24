'use client'
import { motion } from 'framer-motion'
import { pageVariants } from '@/lib/framerVariants'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
      {children}
    </motion.div>
  )
}
