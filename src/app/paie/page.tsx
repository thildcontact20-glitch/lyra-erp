'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, FileText, Calculator, DollarSign, Search, UserCheck, TrendingDown, Lock, ArrowRight } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageTransition from '@/components/animations/PageTransition'
import StaggerContainer from '@/components/animations/StaggerContainer'
import CardFinance from '@/components/ui/CardFinance'
import { fadeUpVariants, listItemVariants } from '@/lib/framerVariants'
import Link from 'next/link'

/* ───────────────────────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────────────────────── */
interface Employee {
  id: string
  firstName: string
  lastName: string
  position: string
  baseSalary: number
  contractType: string
  hireDate: string
}

interface Payroll {
  id: string
  period: string
  employee?: { firstName: string; lastName: string; position: string }
  employeeId: string
  baseSalary: number
  bonuses: number
  indemnities: number
  grossSalary: number
  cnpsEmployee: number
  cnpsEmployer: number
  irTax: number
  netSalary: number
  status: string
}

/* ───────────────────────────────────────────────────────────────
   Fallback Data — Paie CI
   ─────────────────────────────────────────────────────────────── */
const FALLBACK_EMPLOYEES: Employee[] = [
  { id: 'e1', firstName: 'Ibrahim', lastName: 'KONE', position: 'Directeur G\u00e9n\u00e9ral', baseSalary: 2500000, contractType: 'CDI', hireDate: '2020-01-15' },
  { id: 'e2', firstName: 'Fatoumata', lastName: 'DIAKIT\u00c9', position: 'Comptable', baseSalary: 850000, contractType: 'CDI', hireDate: '2021-03-01' },
  { id: 'e3', firstName: 'Mamadou', lastName: 'TRAOR\u00c9', position: 'Commercial', baseSalary: 600000, contractType: 'CDI', hireDate: '2022-06-10' },
  { id: 'e4', firstName: 'Awa', lastName: 'SOW', position: 'Assistante RH', baseSalary: 450000, contractType: 'CDD', hireDate: '2023-09-20' },
  { id: 'e5', firstName: 'Lassina', lastName: 'ZONGO', position: 'Chef de Projet IT', baseSalary: 1200000, contractType: 'CDI', hireDate: '2021-11-01' },
]

const FALLBACK_PAYROLLS: Payroll[] = [
  { id: 'p1', period: '2024-06', employeeId: 'e1', employee: { firstName: 'Ibrahim', lastName: 'KONE', position: 'Directeur G\u00e9n\u00e9ral' }, baseSalary: 2500000, bonuses: 500000, indemnities: 150000, grossSalary: 3150000, cnpsEmployee: 226800, cnpsEmployer: 601650, irTax: 876960, netSalary: 2046240, status: 'VALIDATED' },
  { id: 'p2', period: '2024-06', employeeId: 'e2', employee: { firstName: 'Fatoumata', lastName: 'DIAKIT\u00c9', position: 'Comptable' }, baseSalary: 850000, bonuses: 100000, indemnities: 50000, grossSalary: 1000000, cnpsEmployee: 72000, cnpsEmployer: 191000, irTax: 185600, netSalary: 742400, status: 'VALIDATED' },
  { id: 'p3', period: '2024-06', employeeId: 'e3', employee: { firstName: 'Mamadou', lastName: 'TRAOR\u00c9', position: 'Commercial' }, baseSalary: 600000, bonuses: 75000, indemnities: 30000, grossSalary: 705000, cnpsEmployee: 50760, cnpsEmployer: 134655, irTax: 65424, netSalary: 588816, status: 'VALIDATED' },
  { id: 'p4', period: '2024-06', employeeId: 'e4', employee: { firstName: 'Awa', lastName: 'SOW', position: 'Assistante RH' }, baseSalary: 450000, bonuses: 0, indemnities: 25000, grossSalary: 475000, cnpsEmployee: 34200, cnpsEmployer: 90725, irTax: 44080, netSalary: 396720, status: 'DRAFT' },
  { id: 'p5', period: '2024-06', employeeId: 'e5', employee: { firstName: 'Lassina', lastName: 'ZONGO', position: 'Chef de Projet IT' }, baseSalary: 1200000, bonuses: 200000, indemnities: 100000, grossSalary: 1500000, cnpsEmployee: 108000, cnpsEmployer: 286500, irTax: 278400, netSalary: 1113600, status: 'VALIDATED' },
]

function fmt(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

const tabs = [
  { id: 'employees', label: 'Salari\u00e9s', icon: Users },
  { id: 'payrolls', label: 'Bulletins de Paie', icon: FileText },
] as const
type TabId = typeof tabs[number]['id']

export default function PaiePage() {
  const [activeTab, setActiveTab] = useState<TabId>('employees')
  const [employees, setEmployees] = useState<Employee[]>(FALLBACK_EMPLOYEES)
  const [payrolls, setPayrolls] = useState<Payroll[]>(FALLBACK_PAYROLLS)
  const [searchQ, setSearchQ] = useState('')
  const [expandedPayroll, setExpandedPayroll] = useState<string | null>(null)
  const [planFeatures, setPlanFeatures] = useState<string[] | null>(null)
  const [planName, setPlanName] = useState<string>('')

  useEffect(() => {
    fetch('/api/subscription')
      .then(r => r.ok ? r.json() : Promise.reject('fail'))
      .then(res => {
        const d = res.data || {}
        setPlanFeatures(d.plan?.features || [])
        setPlanName(d.plan?.name || '')
      })
      .catch(() => {
        // fallback: assume full access
        setPlanFeatures(['compta_complete', 'commercial_full', 'payroll'])
        setPlanName('Business')
      })
  }, [])

  useEffect(() => {
    fetch('/api/payroll/employees').then(r => r.ok ? r.json() : Promise.reject()).then(d => setEmployees(d.data)).catch(() => {})
    fetch('/api/payroll/payrolls').then(r => r.ok ? r.json() : Promise.reject()).then(d => setPayrolls(d.data)).catch(() => {})
  }, [])

  const totalMasse = payrolls.reduce((s, p) => s + p.grossSalary, 0)
  const totalNet = payrolls.reduce((s, p) => s + p.netSalary, 0)
  const totalCnpsEmp = payrolls.reduce((s, p) => s + p.cnpsEmployee, 0)
  const totalIr = payrolls.reduce((s, p) => s + p.irTax, 0)

  const filteredEmployees = employees.filter(e =>
    e.lastName.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.firstName.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.position.toLowerCase().includes(searchQ.toLowerCase())
  )
  const filteredPayrolls = payrolls.filter(p =>
    (p.employee?.lastName || '').toLowerCase().includes(searchQ.toLowerCase()) ||
    p.period.toLowerCase().includes(searchQ.toLowerCase())
  )

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-lyra-cream">Paie &amp; CNPS C&ocirc;te d'Ivoire</h1>
              <p className="text-sm text-white/40 mt-1">Salaires &mdash; Cotisations sociales &mdash; IR</p>
            </div>
          </motion.div>

          {/* ── Plan guard for payroll ── */}
          {planFeatures !== null && !planFeatures.includes('payroll') && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="px-5 py-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-amber-200 font-medium">
                    Module Paie &amp; CNPS non disponible
                  </p>
                  <p className="text-xs text-amber-300/60 mt-0.5">
                    Disponible dans les plans Business et Enterprise.
                  </p>
                </div>
              </div>
              <Link href="/pricing">
                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500/15 text-amber-300 text-sm font-medium hover:bg-amber-500/25 transition-colors">
                  Voir les offres <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>
            </motion.div>
          )}

          {/* KPI Cards */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Masse Salariale</span>
                <DollarSign className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{fmt(totalMasse)} FCFA</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Net Total</span>
                <UserCheck className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-emerald-400 mt-2">{fmt(totalNet)} FCFA</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">CNPS Employ&eacute;</span>
                <TrendingDown className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-amber-400 mt-2">{fmt(totalCnpsEmp)} FCFA</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">IR</span>
                <Calculator className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-red-400 mt-2">{fmt(totalIr)} FCFA</p>
            </CardFinance>
          </StaggerContainer>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-lyra-gold/15 text-lyra-gold shadow-sm' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}
              ><tab.icon className="w-4 h-4" />{tab.label}</button>
            ))}
          </div>

          <div className="relative max-w-xs">
            <input type="text"
              placeholder={activeTab === 'employees' ? 'Rechercher un salari\u00e9...' : 'Rechercher un bulletin...'}
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              className="w-full pl-3 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40 transition-colors"
            />
          </div>

          <AnimatePresence mode="wait">
            {/* EMPLOYEES TAB */}
            {activeTab === 'employees' && (
              <motion.div key="employees" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmployees.map((emp, i) => (
                    <motion.div key={emp.id} variants={fadeUpVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}>
                      <CardFinance>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-lyra-gold/10 border border-lyra-gold/20 flex items-center justify-center text-lyra-gold font-bold text-sm">
                            {emp.firstName.charAt(0)}{emp.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-lyra-cream">{emp.firstName} {emp.lastName}</p>
                            <p className="text-xs text-white/50">{emp.position}</p>
                          </div>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-white/40">Salaire de base</span>
                            <span className="text-lyra-cream font-medium">{fmt(emp.baseSalary)} FCFA</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/40">Contrat</span>
                            <span className="text-lyra-gold">{emp.contractType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-white/40">Date embauche</span>
                            <span className="text-white/60">{emp.hireDate}</span>
                          </div>
                        </div>
                      </CardFinance>
                    </motion.div>
                  ))}
                </StaggerContainer>
              </motion.div>
            )}

            {/* PAYROLLS TAB */}
            {activeTab === 'payrolls' && (
              <motion.div key="payrolls" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="space-y-4">
                  {filteredPayrolls.map((p, i) => {
                    const isExpanded = expandedPayroll === p.id
                    return (
                      <motion.div key={p.id} variants={fadeUpVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.05 }}>
                        <CardFinance className="!p-0 overflow-hidden">
                          <div className="p-4 cursor-pointer" onClick={() => setExpandedPayroll(isExpanded ? null : p.id)}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-lyra-gold/10 border border-lyra-gold/15 flex items-center justify-center">
                                  <FileText className="w-4 h-4 text-lyra-gold" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-lyra-cream">
                                    {p.employee?.firstName} {p.employee?.lastName}
                                  </p>
                                  <p className="text-xs text-white/50">{p.employee?.position} &mdash; {p.period}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-lyra-cream">{fmt(p.netSalary)} FCFA</p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${p.status === 'VALIDATED' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                                  {p.status === 'VALIDATED' ? 'Valid\u00e9' : 'Brouillon'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Expanded detail with CNPS & IR breakdown */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-t border-white/10 px-4 py-3"
                              >
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                  <div>
                                    <p className="text-white/40 mb-2 uppercase tracking-wider">Brut</p>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between"><span className="text-white/50">Salaire base</span><span className="text-lyra-cream">{fmt(p.baseSalary)}</span></div>
                                      {p.bonuses > 0 && <div className="flex justify-between"><span className="text-white/50">Primes</span><span className="text-lyra-cream">{fmt(p.bonuses)}</span></div>}
                                      {p.indemnities > 0 && <div className="flex justify-between"><span className="text-white/50">Indemnit\u00e9s</span><span className="text-lyra-cream">{fmt(p.indemnities)}</span></div>}
                                      <div className="flex justify-between border-t border-white/10 pt-1"><span className="text-white/60 font-medium">Salaire Brut</span><span className="text-lyra-cream font-bold">{fmt(p.grossSalary)}</span></div>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-white/40 mb-2 uppercase tracking-wider">Cotisations CNPS</p>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between">
                                        <span className="text-white/50">Part Salariale (7.2%)</span>
                                        <span className="text-amber-400 font-medium">{fmt(p.cnpsEmployee)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-white/50">Part Patronale (19.1%)</span>
                                        <span className="text-red-400 font-medium">{fmt(p.cnpsEmployer)}</span>
                                      </div>
                                      <div className="flex justify-between border-t border-white/10 pt-1">
                                        <span className="text-white/60 font-medium">Total CNPS</span>
                                        <span className="text-amber-400 font-bold">{fmt(p.cnpsEmployee + p.cnpsEmployer)}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <p className="text-white/40 mb-2 uppercase tracking-wider">IR / Net</p>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between">
                                        <span className="text-white/50">Base imposable</span>
                                        <span className="text-lyra-cream">{fmt(p.grossSalary - p.cnpsEmployee)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-white/50">Imp\u00f4t sur le Revenu</span>
                                        <span className="text-red-400 font-medium">{fmt(p.irTax)}</span>
                                      </div>
                                      <div className="flex justify-between border-t border-lyra-gold/30 pt-1">
                                        <span className="text-emerald-400 font-semibold">Net \u00e0 payer</span>
                                        <span className="text-emerald-400 font-bold text-sm">{fmt(p.netSalary)} FCFA</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardFinance>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </AppShell>
  )
}
