'use client'
import { motion } from 'framer-motion'
import { staggerContainerVariants } from '../../lib/framerVariants'

export default function StaggerContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerContainerVariants} initial="hidden" animate="visible" className={className}>
      {children}
    </motion.div>
  )
}
