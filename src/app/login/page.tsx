'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Lock, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { fadeUpVariants } from '../../lib/framerVariants'
import ButtonElegant from '../../components/ui/ButtonElegant'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
        setError(data.error || 'Une erreur est survenue')
        return
      }

      if (data.error === 'EMAIL_NOT_VERIFIED') {
        router.push(`/verify-email?email=${encodeURIComponent(data.email || email)}`)
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  // Vérifier si on arrive depuis /verify-email (succès)
  const [verifiedMessage, setVerifiedMessage] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('verified') === 'true') {
      setVerifiedMessage(true)
      // Nettoyer l'URL
      window.history.replaceState({}, '', '/login')
    }
  }, [])

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-lyra-dark overflow-hidden">
      {/* Image de fond */}
      <div className="absolute inset-0">
        <Image
          src="/img/bg-login.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>
      {/* Surcharge sombre */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 w-full max-w-md px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          {/* Logo Coris */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Image
              src="/img/coris.png"
              alt="Coris"
              width={160}
              height={68}
              className="object-contain mx-auto"
              priority
            />
          </motion.div>

          <motion.h1
            className="text-2xl md:text-3xl font-display font-bold text-lyra-cream"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            Connexion à LYRA
          </motion.h1>
          <motion.p
            className="text-white/40 text-sm mt-2"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            Accédez à votre espace ERP
          </motion.p>
        </motion.div>

        {/* Card */}
        <motion.div
          className="relative backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Gold accent top border */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-lyra-gold/40 to-transparent" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Verified success message */}
            {verifiedMessage && (
              <motion.div
                className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CheckCircle2 className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                Email vérifié avec succès ! Connectez-vous.
              </motion.div>
            )}

            {/* Error message */}
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {/* Email */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.2 }}
            >
              <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-2">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-lyra-gold transition-colors duration-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@entreprise.ci"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-lyra-cream text-sm placeholder:text-white/20 outline-none focus:border-lyra-gold/50 focus:bg-white/[0.07] transition-all duration-300"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
            >
              <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-2">
                Mot de passe
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-lyra-gold transition-colors duration-300" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-lyra-cream text-sm placeholder:text-white/20 outline-none focus:border-lyra-gold/50 focus:bg-white/[0.07] transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-lyra-gold transition-colors duration-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Remember me + Forgot password */}
            <motion.div
              className="flex items-center justify-between"
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.35 }}
            >
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border transition-all duration-300 ${
                      rememberMe
                        ? 'bg-lyra-gold border-lyra-gold'
                        : 'bg-white/5 border-white/20 group-hover:border-white/40'
                    }`}
                  >
                    {rememberMe && (
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        className="w-4 h-4 text-lyra-dark"
                      >
                        <path
                          d="M4 8L7 11L12 5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-white/40 group-hover:text-white/60 transition-colors duration-300">
                  Se souvenir de moi
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-xs text-lyra-gold/60 hover:text-lyra-gold transition-colors duration-300"
              >
                Mot de passe oublié ?
              </Link>
            </motion.div>

            {/* Submit button */}
            <motion.div
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              <ButtonElegant
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Connexion...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Se connecter
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </ButtonElegant>
            </motion.div>
          </form>

          {/* Signup link */}
          <motion.div
            className="mt-6 text-center"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.45 }}
          >
            <p className="text-xs text-white/30">
              Pas encore de compte ?{' '}
              <Link
                href="/signup"
                className="text-lyra-gold/70 hover:text-lyra-gold transition-colors duration-300 font-medium"
              >
                Créer un compte
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom decoration */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <p className="text-[10px] text-white/15 tracking-[0.1em]">
            &copy; {new Date().getFullYear()} LYRA by Vivalys — ERP OHADA
          </p>
        </motion.div>
      </div>
    </main>
  )
}
