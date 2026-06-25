'use client'
import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface Props {
  className?: string
  showIcon?: boolean
  format?: 'full' | 'time-only'
}

export default function RealtimeClock({ className = '', showIcon = true, format = 'full' }: Props) {
  const [time, setTime] = useState<Date | null>(null)

  useEffect(() => {
    setTime(new Date())
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  if (!time) return null

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const seconds = time.getSeconds().toString().padStart(2, '0')

  const dateStr = time.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  return (
    <div className={`flex items-center gap-1.5 text-lyra-cream/50 text-xs ${className}`}>
      {showIcon && <Clock className="w-3.5 h-3.5" aria-hidden="true" />}
      <span suppressHydrationWarning>
        {format === 'full' ? `${dateStr} · ${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`}
      </span>
    </div>
  )
}
