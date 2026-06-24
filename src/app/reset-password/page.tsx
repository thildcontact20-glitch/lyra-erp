'use client'
import { Suspense, useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Sparkles, Lock, Eye, EyeOff } from 'lucide-react'
import { fadeUpVariants } from '../../lib/framerVariants'
import ButtonElegant from '../../components/ui/ButtonElegant'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailFromUrl = searchParams.get('email') || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState(emailFromUrl)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [resendLoading, setResendLoading] = useState(false)
  const [devCode, setDevCode] = useState('')

  // New password fields
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Rediriger si pas d'email
  useEffect(() => {
    if (!emailFromUrl) {
      router.push('/forgot-password')
    }
  }, [emailFromUrl, router])

  // Focus first code input
  useEffect(() => {
    if (inputRefs.current[0] && emailFromUrl) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [emailFromUrl])

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => {
      setResendTimer((t) => t - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  // Envoyer le code au chargement
  useEffect(() => {
    if (emailFromUrl) {
      handleResend()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailFromUrl])

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(0, 1)
    setCode(newCode)
    setError('')

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = pasted.split('')
    while (newCode.length < 6) newCode.push('')
    setCode(newCode)

    const lastFilled = newCode.findLastIndex((c) => c !== '')
    const focusIndex = lastFilled < 5 ? lastFilled + 1 : 5
    inputRefs.current[focusIndex]?.focus()
  }

  const handleReset = async () => {
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError('Veuillez saisir le code complet à 6 chiffres')
      return
    }

    if (!newPassword) {
      setError('Veuillez saisir un nouveau mot de passe')
      return
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Code invalide')
        return
      }

      setSuccess(true)

      setTimeout(() => {
        router.push('/login?reset=true')
      }, 2000)
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendTimer > 0) return

    setResendLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (data.dev_code) {
        setDevCode(data.dev_code)
      }

      setResendTimer(60)
      setCode(['', '', '', '', '', ''])
    } catch {
      setError('Erreur de connexion au serveur')
    } finally {
      setResendLoading(false)
    }
  }

  // Success screen
  if (success) {
    return (
      <main className="relative min-h-screen flex items-center justify-center bg-lyra-dark overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lyra-navy/60 via-lyra-dark to-lyra-dark" />
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-lyra-gold/5 blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-80 h-80 rounded-full bg-lyra-steel/5 blur-[100px]"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10 w-full max-w-md px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </motion.div>

          <motion.h2
            className="text-2xl font-display font-bold text-lyra-cream mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Mot de passe réinitialisé !
          </motion.h2>
          <motion.p
            className="text-white/50 text-sm mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Vous allez être redirigé vers la page de connexion...
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <div className="w-8 h-8 border-2 border-lyra-gold/30 border-t-lyra-gold rounded-full animate-spin" />
          </motion.div>
        </div>
      </main>
    )
  }

  // Si pas d'email, ne rien afficher (redirection en cours)
  if (!emailFromUrl) {
    return (
      <main className="relative min-h-screen flex items-center justify-center bg-lyra-dark overflow-hidden">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 w-full max-w-md px-4 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-lyra-gold/30 border-t-lyra-gold rounded-full animate-spin" />
        </div>
      </main>
    )
  }

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

      {/* Decorative top line */}
      <motion.div
        className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-lyra-gold/30 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />

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
            Nouveau mot de passe
          </motion.h1>
          <motion.p
            className="text-white/40 text-sm mt-2"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            Un code a été envoyé à {email}
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

          <div className="space-y-5">
            {/* Email (read-only) */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-2">
                Compte
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-lyra-gold/40" />
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl pl-10 pr-4 py-3 text-lyra-cream/60 text-sm cursor-not-allowed outline-none"
                />
              </div>
            </div>

            {/* Dev code hint */}
            <AnimatePresence>
              {devCode && (
                <motion.div
                  className="bg-lyra-gold/10 border border-lyra-gold/20 text-lyra-gold text-sm rounded-xl px-4 py-3 text-center font-mono tracking-widest"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  🔧 Code de développement : {devCode}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error message */}
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <AlertCircle className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                {error}
              </motion.div>
            )}

            {/* Code inputs */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-3 text-center">
                Code de vérification
              </label>
              <div className="flex gap-2 justify-center">
                {code.map((digit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <input
                      ref={(el) => { inputRefs.current[index] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-11 h-12 md:w-12 md:h-13 bg-white/5 border border-white/10 rounded-xl text-center text-lyra-cream text-lg font-mono font-bold outline-none focus:border-lyra-gold/50 focus:bg-white/[0.07] transition-all duration-300"
                      style={{
                        borderColor: digit ? 'rgba(201, 169, 97, 0.4)' : undefined,
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-2">
                Nouveau mot de passe
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-lyra-gold transition-colors duration-300" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 caractères"
                  required
                  minLength={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-lyra-cream text-sm placeholder:text-white/20 outline-none focus:border-lyra-gold/50 focus:bg-white/[0.07] transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-lyra-gold transition-colors duration-300"
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs uppercase tracking-[0.15em] text-white/40 mb-2">
                Confirmer le mot de passe
              </label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-lyra-gold transition-colors duration-300" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ressaisir le mot de passe"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-lyra-cream text-sm placeholder:text-white/20 outline-none focus:border-lyra-gold/50 focus:bg-white/[0.07] transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-lyra-gold transition-colors duration-300"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Reset button */}
            <ButtonElegant
              type="button"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={loading || code.join('').length < 6 || !newPassword || !confirmPassword}
              onClick={handleReset}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Réinitialisation...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Réinitialiser
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </ButtonElegant>

            {/* Resend link */}
            <div className="text-center">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || resendLoading}
                className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-lyra-gold transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                {resendTimer > 0
                  ? `Renvoyer le code (${resendTimer}s)`
                  : 'Renvoyer le code'}
              </button>
            </div>
          </div>

          {/* Retour */}
          <motion.div
            className="mt-6 text-center"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.45 }}
          >
            <Link
              href="/forgot-password"
              className="text-xs text-lyra-gold/60 hover:text-lyra-gold transition-colors duration-300"
            >
              Retour
            </Link>
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="relative min-h-screen flex items-center justify-center bg-lyra-dark overflow-hidden">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 w-full max-w-md px-4 text-center">
          <div className="w-8 h-8 mx-auto border-2 border-lyra-gold/30 border-t-lyra-gold rounded-full animate-spin" />
        </div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
