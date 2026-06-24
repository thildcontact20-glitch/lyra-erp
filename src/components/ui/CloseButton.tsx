'use client'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

interface CloseButtonProps {
  onClose: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
}

const iconSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

export default function CloseButton({
  onClose,
  className = '',
  size = 'md',
}: CloseButtonProps) {
  return (
    <motion.button
      onClick={onClose}
      className={`absolute top-3 right-3 flex items-center justify-center rounded-lg ${sizeClasses[size]} bg-white/5 hover:bg-white/10 text-white/40 hover:text-lyra-gold transition-colors z-50 ${className}`}
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      aria-label="Fermer"
    >
      <X className={iconSizeClasses[size]} />
    </motion.button>
  )
}
