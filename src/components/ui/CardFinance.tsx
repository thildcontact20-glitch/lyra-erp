'use client'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface CardFinanceProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export default function CardFinance({ children, className, hover = true }: CardFinanceProps) {
  return (
    <motion.div
      className={clsx(
        'glass rounded-xl p-5 gold-border',
        hover && 'cursor-pointer',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, borderColor: 'rgba(201,169,97,0.4)' } : undefined}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
