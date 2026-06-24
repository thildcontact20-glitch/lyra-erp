'use client'
import { motion } from 'framer-motion'
import clsx from 'clsx'

interface ButtonElegantProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  href?: string
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

export default function ButtonElegant({
  children, variant = 'primary', size = 'md',
  onClick, className, type = 'button', disabled
}: ButtonElegantProps) {
  const base = 'relative inline-flex items-center justify-center font-medium rounded-xl transition-all overflow-hidden'
  const sizes = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' }
  const variants = {
    primary: 'bg-lyra-gold text-lyra-dark hover:bg-lyra-goldlight shadow-lg shadow-lyra-gold/20',
    secondary: 'bg-white/5 text-lyra-cream border border-white/10 hover:bg-white/10',
    outline: 'bg-transparent text-lyra-gold border border-lyra-gold/30 hover:border-lyra-gold/60',
  }
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(base, sizes[size], variants[variant], className, disabled && 'opacity-50 cursor-not-allowed')}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  )
}
