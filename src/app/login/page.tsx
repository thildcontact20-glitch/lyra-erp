'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)

  // Détecter si on arrive depuis verify-email
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('verified') === 'true' && !verified) setVerified(true)
  }

  const login = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'EMAIL_NOT_VERIFIED') {
          router.push(`/verify-email?email=${encodeURIComponent(data.email || email)}`)
          return
        }
        setError(data.error || 'Erreur')
        return
      }
      localStorage.setItem('token', data.token)
      window.location.href = '/dashboard'
    } catch {
      setError('Erreur réseau')
    } finally { setLoading(false) }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login()
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-lyra-dark overflow-hidden">
      <div className="absolute inset-0">
        <Image src="/img/bg-login.jpg" alt="" fill className="object-cover" priority />
      </div>
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="text-center mb-8">
          {/* Logo */}
          <motion.img
            src="/img/coris.png"
            alt="Coris"
            style={{ width: 140, margin: '0 auto 24px' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <h1 className="text-2xl font-bold text-lyra-cream mb-1">Connexion à LYRA</h1>
          <p className="text-white/40 text-sm">Accédez à votre espace ERP</p>
        </div>

        <div className="relative backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 shadow-2xl">
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-lyra-gold/40 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5">

            {verified && (
              <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 text-center">
                ✅ Email vérifié ! Connectez-vous.
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@entreprise.ci"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lyra-cream text-sm placeholder:text-white/20 outline-none focus:border-lyra-gold/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-white/40 mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lyra-cream text-sm placeholder:text-white/20 outline-none focus:border-lyra-gold/50 transition-all"
              />
            </div>

            <div className="flex items-center justify-between">
              <Link href="/forgot-password" className="text-xs text-lyra-gold/60 hover:text-lyra-gold transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-lyra-gold hover:bg-yellow-500 text-lyra-dark font-semibold rounded-xl px-8 py-4 text-base transition-all disabled:opacity-50 shadow-lg shadow-lyra-gold/20 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion...
                </>
              ) : (
                <>
                  Se connecter <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-white/30">
              Pas encore de compte ?{' '}
              <Link href="/signup" className="text-lyra-gold hover:text-lyra-goldlight transition-colors font-medium">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-white/15">
          &copy; 2026 LYRA by Vivalys — ERP LYRA
        </p>
      </div>
    </main>
  )
}
