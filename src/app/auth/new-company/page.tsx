'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Building2, Calendar, CheckCircle, ArrowRight, ArrowLeft,
  Sparkles, Check, ChevronRight,
} from 'lucide-react'
import { fadeUpVariants } from '../../../lib/framerVariants'
import ButtonElegant from '../../../components/ui/ButtonElegant'

/* ───────────────────────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────────────────────── */
interface CompanyData {
  name: string
  legalForm: string
  city: string
  phone: string
  email: string
}

interface ExerciseData {
  startYear: string
  endYear: string
}

/* ───────────────────────────────────────────────────────────────
   Step configuration
   ─────────────────────────────────────────────────────────────── */
const LEGAL_FORMS = ['SA', 'SARL', 'SAS', 'GIE', 'Autre']
const YEAR_OPTIONS = ['2023', '2024', '2025', '2026']

const STEPS = [
  { label: 'Société', icon: Building2 },
  { label: 'Exercice', icon: Calendar },
  { label: 'Confirmation', icon: CheckCircle },
]

/* ───────────────────────────────────────────────────────────────
   Slide variants for step transitions
   ─────────────────────────────────────────────────────────────── */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
}

/* ───────────────────────────────────────────────────────────────
   Stepper visual
   ─────────────────────────────────────────────────────────────── */
function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const isActive = i === currentStep
        const isCompleted = i < currentStep
        const Icon = step.icon

        return (
          <div key={step.label} className="flex items-center">
            {/* Step dot + label */}
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isActive
                    ? 'border-lyra-gold bg-lyra-gold/10 text-lyra-gold'
                    : isCompleted
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 bg-white/5 text-white/30'
                }`}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </motion.div>
              <span
                className={`text-[10px] uppercase tracking-[0.1em] transition-colors duration-300 ${
                  isActive
                    ? 'text-lyra-gold'
                    : isCompleted
                      ? 'text-emerald-400'
                      : 'text-white/30'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector between steps */}
            {i < STEPS.length - 1 && (
              <div className="w-12 md:w-20 h-px mx-2 relative">
                <div className="absolute inset-0 bg-white/10" />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-lyra-gold/40"
                  initial={{ width: '0%' }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Input field component
   ─────────────────────────────────────────────────────────────── */
function FormField({
  label, value, onChange, placeholder, type = 'text', required, options, icon,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  options?: string[]
  icon?: React.ElementType
}) {
  const Icon = icon
  return (
    <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" className="space-y-1.5">
      <label className="block text-xs uppercase tracking-[0.15em] text-white/40">
        {label}
      </label>
      <div className="relative group">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-lyra-gold transition-colors duration-300" />
        )}
        {options ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className={`w-full bg-white/5 border border-white/10 rounded-xl ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 text-lyra-cream text-sm outline-none focus:border-lyra-gold/50 focus:bg-white/[0.07] transition-all duration-300 appearance-none cursor-pointer`}
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
            }}
          >
            <option value="" disabled>Sélectionner</option>
            {options.map((opt) => (
              <option key={opt} value={opt} className="bg-lyra-navy text-lyra-cream">
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className={`w-full bg-white/5 border border-white/10 rounded-xl ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3 text-lyra-cream text-sm placeholder:text-white/20 outline-none focus:border-lyra-gold/50 focus:bg-white/[0.07] transition-all duration-300`}
          />
        )}
      </div>
    </motion.div>
  )
}

/* ───────────────────────────────────────────────────────────────
   Summary row
   ─────────────────────────────────────────────────────────────── */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-white/40">{label}</span>
      <span className="text-sm text-lyra-cream font-medium">{value}</span>
    </div>
  )
}

/* ───────────────────────────────────────────────────────────────
   New Company Page
   ─────────────────────────────────────────────────────────────── */
export default function NewCompanyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Step 1 — Company info
  const [company, setCompany] = useState<CompanyData>({
    name: '',
    legalForm: '',
    city: '',
    phone: '',
    email: '',
  })

  // Step 2 — Exercise info
  const [exercise, setExercise] = useState<ExerciseData>({
    startYear: '',
    endYear: '',
  })

  const updateCompany = (field: keyof CompanyData) => (value: string) =>
    setCompany((prev) => ({ ...prev, [field]: value }))

  const updateExercise = (field: keyof ExerciseData) => (value: string) =>
    setExercise((prev) => ({ ...prev, [field]: value }))

  /* ── Validation per step ── */
  const isStepValid = (): boolean => {
    if (currentStep === 0) {
      return (
        company.name.trim() !== '' &&
        company.legalForm !== '' &&
        company.city.trim() !== '' &&
        company.phone.trim() !== '' &&
        company.email.trim() !== ''
      )
    }
    if (currentStep === 1) {
      return (
        exercise.startYear !== '' &&
        exercise.endYear !== '' &&
        parseInt(exercise.endYear) >= parseInt(exercise.startYear)
      )
    }
    return true
  }

  /* ── Navigation ── */
  const nextStep = () => {
    if (!isStepValid()) return
    if (currentStep < STEPS.length - 1) {
      setDirection(1)
      setCurrentStep((prev) => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1)
      setCurrentStep((prev) => prev - 1)
    }
  }

  /* ── Submit ── */
  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, exercise }),
      })

      if (!res.ok) {
        // API doesn't exist yet, simulate success
        console.log('API /api/auth/setup not available yet, simulating success')
      }

      setSuccess(true)

      // Set onboarding flag
      localStorage.setItem('first_login', 'true')

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch {
      // API doesn't exist yet — simulate success
      setSuccess(true)
      localStorage.setItem('first_login', 'true')
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-lyra-dark overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-lyra-navy/60 via-lyra-dark to-lyra-dark" />

      {/* Glowing orbs */}
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

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201, 169, 97, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(201, 169, 97, 0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Decorative top line */}
      <motion.div
        className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-lyra-gold/30 to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      />

      <div className="relative z-10 w-full max-w-lg px-4 py-8">
        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-8"
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full border border-lyra-gold/20 bg-lyra-gold/5 text-lyra-gold text-[10px] tracking-[0.2em] uppercase"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="w-3 h-3" />
            Configuration
          </motion.div>

          <motion.h1
            className="text-2xl md:text-3xl font-display font-bold text-lyra-cream"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            Configuration de votre société
          </motion.h1>
          <motion.p
            className="text-white/40 text-sm mt-2"
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            Paramétrez votre entreprise en 3 étapes
          </motion.p>
        </motion.div>

        {/* ── Stepper ── */}
        <Stepper currentStep={currentStep} />

        {/* ── Card ── */}
        <motion.div
          className="relative backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-2xl min-h-[400px]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Gold accent top border */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-lyra-gold/40 to-transparent" />

          {/* ── Success state ── */}
          {success ? (
            <motion.div
              className="flex flex-col items-center justify-center py-10 gap-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              >
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-lyra-cream">Société créée avec succès !</h3>
              <p className="text-sm text-white/40 text-center">
                Votre société est prête. Vous allez être redirigé vers le tableau de bord...
              </p>
              <motion.div
                className="w-8 h-8 border-2 border-lyra-gold/30 border-t-lyra-gold rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          ) : (
            <>
              {/* ── Animated step content ── */}
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-5"
                >
                  {/* Step 1 — Company */}
                  {currentStep === 0 && (
                    <>
                      <div className="text-center mb-2">
                        <p className="text-sm text-white/60 font-medium">Informations de la société</p>
                      </div>
                      <FormField
                        label="Nom de la société"
                        value={company.name}
                        onChange={updateCompany('name')}
                        placeholder="Ma société SARL"
                        required
                        icon={Building2}
                      />
                      <FormField
                        label="Forme juridique"
                        value={company.legalForm}
                        onChange={updateCompany('legalForm')}
                        options={LEGAL_FORMS}
                        required
                      />
                      <FormField
                        label="Ville"
                        value={company.city}
                        onChange={updateCompany('city')}
                        placeholder="Abidjan"
                        required
                        icon={Building2}
                      />
                      <FormField
                        label="Téléphone"
                        value={company.phone}
                        onChange={updateCompany('phone')}
                        placeholder="+225 01 02 03 04 05"
                        required
                        type="tel"
                      />
                      <FormField
                        label="Email"
                        value={company.email}
                        onChange={updateCompany('email')}
                        placeholder="contact@societe.ci"
                        required
                        type="email"
                      />
                    </>
                  )}

                  {/* Step 2 — Exercise */}
                  {currentStep === 1 && (
                    <>
                      <div className="text-center mb-2">
                        <p className="text-sm text-white/60 font-medium">Exercice comptable</p>
                        <p className="text-xs text-white/30 mt-1">
                          Définissez la période de votre premier exercice
                        </p>
                      </div>
                      <FormField
                        label="Année de début"
                        value={exercise.startYear}
                        onChange={updateExercise('startYear')}
                        options={YEAR_OPTIONS}
                        required
                      />
                      <FormField
                        label="Année de fin"
                        value={exercise.endYear}
                        onChange={updateExercise('endYear')}
                        options={YEAR_OPTIONS}
                        required
                      />
                      {exercise.startYear && exercise.endYear && parseInt(exercise.endYear) < parseInt(exercise.startYear) && (
                        <motion.p
                          className="text-xs text-red-400 text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          L&apos;année de fin doit être supérieure ou égale à l&apos;année de début
                        </motion.p>
                      )}
                    </>
                  )}

                  {/* Step 3 — Confirmation */}
                  {currentStep === 2 && (
                    <>
                      <div className="text-center mb-4">
                        <p className="text-sm text-white/60 font-medium">Récapitulatif</p>
                        <p className="text-xs text-white/30 mt-1">
                          Vérifiez vos informations avant de créer la société
                        </p>
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-4 space-y-1 border border-white/5">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-lyra-gold/60 mb-3">Société</p>
                        <SummaryRow label="Nom" value={company.name} />
                        <SummaryRow label="Forme juridique" value={company.legalForm} />
                        <SummaryRow label="Ville" value={company.city} />
                        <SummaryRow label="Téléphone" value={company.phone} />
                        <SummaryRow label="Email" value={company.email} />
                      </div>
                      <div className="bg-white/[0.02] rounded-xl p-4 space-y-1 border border-white/5">
                        <p className="text-[10px] uppercase tracking-[0.15em] text-lyra-gold/60 mb-3">Exercice</p>
                        <SummaryRow label="Début" value={exercise.startYear} />
                        <SummaryRow label="Fin" value={exercise.endYear} />
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* ── Navigation buttons ── */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/5">
                <div>
                  {currentStep > 0 && (
                    <ButtonElegant variant="secondary" size="md" onClick={prevStep}>
                      <span className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Précédent
                      </span>
                    </ButtonElegant>
                  )}
                </div>
                <div>
                  {currentStep < STEPS.length - 1 ? (
                    <ButtonElegant
                      variant="primary"
                      size="md"
                      onClick={nextStep}
                      disabled={!isStepValid()}
                    >
                      <span className="flex items-center gap-2">
                        Suivant
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </ButtonElegant>
                  ) : (
                    <ButtonElegant
                      variant="primary"
                      size="md"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Création...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Créer et commencer
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </ButtonElegant>
                  )}
                </div>
              </div>
            </>
          )}
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
