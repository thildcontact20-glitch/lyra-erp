'use client'
import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Cloud, CloudRain, CloudSun, Sun, Snowflake, Loader2 } from 'lucide-react'

interface Props {
  className?: string
  compact?: boolean
}

interface WeatherData {
  city: string
  temperature: number
  condition: 'sunny' | 'cloudy' | 'rainy' | 'partly_cloudy' | 'snow'
  loading: boolean
  error: boolean
}

function getWeatherIcon(condition: WeatherData['condition']) {
  switch (condition) {
    case 'sunny': return Sun
    case 'cloudy': return Cloud
    case 'rainy': return CloudRain
    case 'partly_cloudy': return CloudSun
    case 'snow': return Snowflake
    default: return Cloud
  }
}

export default function WeatherWidget({ className = '', compact = false }: Props) {
  const [weather, setWeather] = useState<WeatherData>({
    city: 'Abidjan',
    temperature: 0,
    condition: 'sunny',
    loading: true,
    error: false,
  })
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    let cancelled = false

    async function fetchWeather() {
      try {
        // Open-Meteo API — pas de clé nécessaire, latitude/longitude Abidjan
        const geoRes = await fetch(
          'https://geocoding-api.open-meteo.com/v1/search?name=Abidjan&count=1&language=fr&format=json'
        )
        const geoData = await geoRes.json()
        const location = geoData.results?.[0]
        const cityName = location?.name || 'Abidjan'
        const lat = location?.latitude || 5.36
        const lon = location?.longitude || -4.01

        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`
        )
        const weatherData = await weatherRes.json()
        const current = weatherData.current_weather

        if (cancelled) return

        // Convertir code météo WMO en condition lisible
        const code = current.weathercode ?? 0
        let condition: WeatherData['condition'] = 'sunny'
        if (code >= 1 && code <= 3) condition = 'partly_cloudy'
        else if (code >= 4 && code <= 49) condition = 'cloudy'
        else if ((code >= 50 && code <= 69) || (code >= 80 && code <= 84)) condition = 'rainy'
        else if (code >= 70 && code <= 79) condition = 'snow'

        setWeather({
          city: cityName,
          temperature: Math.round(current.temperature),
          condition,
          loading: false,
          error: false,
        })
      } catch {
        if (!cancelled) {
          setWeather((prev) => ({ ...prev, loading: false, error: true }))
        }
      }
    }

    fetchWeather()
    // Rafraîchir toutes les 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  if (weather.loading) {
    return (
      <div className={`flex items-center gap-2 text-lyra-cream/30 text-xs ${className}`}>
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Météo...</span>
      </div>
    )
  }

  if (weather.error) {
    return null // fallback silencieux
  }

  const Icon = getWeatherIcon(weather.condition)

  return (
    <motion.div
      initial={prefersReducedMotion ? undefined : { opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-center gap-1.5 text-lyra-cream/50 text-xs ${className}`}
      role="status"
      aria-label={`Météo à ${weather.city}, ${weather.temperature} degrés`}
    >
      <Icon className="w-3.5 h-3.5 text-lyra-gold/60" aria-hidden="true" />
      {compact ? (
        <span suppressHydrationWarning>{weather.temperature}°</span>
      ) : (
        <span suppressHydrationWarning>
          {weather.city} · {weather.temperature}°C
        </span>
      )}
    </motion.div>
  )
}
