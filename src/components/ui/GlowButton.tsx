'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRef, useCallback, useState } from 'react'

interface GlowButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
  glowColor?: string
}

const variantsStyles = {
  primary:
    'bg-lyra-gold text-lyra-dark shadow-lg shadow-lyra-gold/20',
  secondary:
    'bg-white/5 text-lyra-cream border border-white/10',
  outline:
    'bg-transparent text-lyra-gold border border-lyra-gold/30',
}

export default function GlowButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
  glowColor,
}: GlowButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  // Default glow matches variant
  const resolvedGlow =
    glowColor ??
    (variant === 'primary'
      ? 'rgba(212,175,55,0.35)'
      : 'rgba(212,175,55,0.15)')

  const defaultBg = variantsStyles[variant]
  const child = (
    <motion.div
      ref={ref}
      className={`relative inline-flex items-center justify-center font-medium rounded-xl overflow-hidden cursor-pointer ${defaultBg} ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setMousePos({ x: 50, y: 50 })
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glow spot */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, ${resolvedGlow} 0%, transparent 60%)`,
        }}
      />
      <span className="relative z-10 flex items-center gap-2 px-6 py-3">
        {children}
      </span>
    </motion.div>
  )

  if (href) {
    return <Link href={href}>{child}</Link>
  }

  return <div onClick={onClick}>{child}</div>
}
