'use client'
import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  tiltMax?: number
  glowColor?: string
  perspective?: number
}

export default function TiltCard({
  children,
  className = '',
  tiltMax = 8,
  glowColor = 'rgba(212,175,55,0.15)',
  perspective = 1000,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const [rotate, setRotate] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      setRotate({
        x: -(y - 0.5) * tiltMax,
        y: (x - 0.5) * tiltMax,
      })
      setGlow({ x: x * 100, y: y * 100 })
    },
    [tiltMax],
  )

  const handleMouseLeave = useCallback(() => {
    setRotate({ x: 0, y: 0 })
    setGlow({ x: 50, y: 50 })
    setIsHovered(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!ref.current || !e.touches[0]) return
    const rect = ref.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = (touch.clientX - rect.left) / rect.width
    const y = (touch.clientY - rect.top) / rect.height
    setRotate({
      x: -(y - 0.5) * tiltMax,
      y: (x - 0.5) * tiltMax,
    })
    setGlow({ x: x * 100, y: y * 100 })
    setIsHovered(true)
  }, [tiltMax])

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      style={{ perspective: `${perspective}px` }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => {
        setRotate({ x: 0, y: 0 })
        setGlow({ x: 50, y: 50 })
        setIsHovered(false)
      }}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{
          rotateX: rotate.x,
          rotateY: rotate.y,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, mass: 0.5 }}
      >
        {/* Glow spot effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, ${glowColor} 0%, transparent 70%)`,
          }}
        />
        {children}
      </motion.div>
    </motion.div>
  )
}
