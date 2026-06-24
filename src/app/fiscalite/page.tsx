'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, FileText, Calculator, Percent, Search, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import AppShell from '@/components/layout/AppShell'
import PageTransition from '@/components/animations/PageTransition'
import StaggerContainer from '@/components/animations/StaggerContainer'
import CardFinance from '@/components/ui/CardFinance'
import ButtonElegant from '@/components/ui/ButtonElegant'
import { fadeUpVariants, listItemVariants } from '@/lib/framerVariants'

/* ───────────────────────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────────────────────── */
interface TaxDeclaration {
  id: string
  period: string
  totalCollected: number
  totalDeductible: number
  netDue: number
  status: string
  createdAt: string
}

/* ───────────────────────────────────────────────────────────────
   Fallback Data — Fiscalit\u00e9 Ivoirienne
   ─────────────────────────────────────────────────────────────── */
const FALLBACK_DECLARATIONS: TaxDeclaration[] = [
  { id: 't1', period: '2024-05', totalCollected: 1250000, totalDeductible: 380000, netDue: 870000, status: 'FILED', createdAt: '2024-06-15' },
  { id: 't2', period: '2024-04', totalCollected: 980000, totalDeductible: 250000, netDue: 730000, status: 'FILED', createdAt: '2024-05-16' },
  { id: 't3', period: '2024-03', totalCollected: 1420000, totalDeductible: 420000, netDue: 1000000, status: 'FILED', createdAt: '2024-04-15' },
  { id: 't4', period: '2024-02', totalCollected: 810000, totalDeductible: 190000, netDue: 620000, status: 'FILED', createdAt: '2024-03-14' },
  { id: 't5', period: '2024-01', totalCollected: 1100000, totalDeductible: 310000, netDue: 790000, status: 'PAID', createdAt: '2024-02-15' },
]

const TVA_RATE = 18

const statusCfg: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  FILED: { label: 'D\u00e9pos\u00e9e', color: 'text-blue-400 bg-blue-500/10', icon: FileText },
  PAID: { label: 'Pay\u00e9e', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle },
  DRAFT: { label: 'Brouillon', color: 'text-amber-400 bg-amber-500/10', icon: Clock },
}

function fmt(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

const tabs = [
  { id: 'declarations', label: 'D\u00e9clarations', icon: FileText },
  { id: 'simulator', label: 'Simulateur TVA', icon: Calculator },
  { id: 'params', label: 'Param\u00e8tres', icon: Percent },
] as const
type TabId = typeof tabs[number]['id']

export default function FiscalitePage() {
  const [activeTab, setActiveTab] = useState<TabId>('declarations')
  const [declarations, setDeclarations] = useState<TaxDeclaration[]>(FALLBACK_DECLARATIONS)
  const [searchQ, setSearchQ] = useState('')

  // Simulator
  const [htAmount, setHtAmount] = useState<number>(1000000)

  useEffect(() => {
    fetch('/api/tax/declarations').then(r => r.ok ? r.json() : Promise.reject()).then(d => setDeclarations(d.data)).catch(() => {})
  }, [])

  const filteredDeclarations = declarations.filter(d => d.period.includes(searchQ))

  const tvaCalculated = Math.round(htAmount * TVA_RATE / 100)
  const ttcAmount = htAmount + tvaCalculated

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-lyra-cream">Fiscalit&eacute; Ivoirienne</h1>
              <p className="text-sm text-white/40 mt-1">TVA &mdash; D&eacute;clarations fiscales &mdash; Simulateur</p>
            </div>
          </motion.div>

          {/* KPI */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">D&eacute;clarations</span>
                <FileText className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{declarations.length}</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Total TVA Net</span>
                <DollarSign className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{fmt(declarations.reduce((s, d) => s + d.netDue, 0))} FCFA</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Taux TVA</span>
                <Percent className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{TVA_RATE}%</p>
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

          <AnimatePresence mode="wait">
            {/* DECLARATIONS TAB */}
            {activeTab === 'declarations' && (
              <motion.div key="declarations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="relative max-w-xs mb-4">
                  <input type="text" placeholder="Rechercher par p\u00e9riode..." value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                    className="w-full pl-3 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-lyra-cream placeholder-white/30 focus:outline-none focus:border-lyra-gold/40 transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  {filteredDeclarations.map((d, i) => {
                    const cfg = statusCfg[d.status] || statusCfg.DRAFT
                    const Icon = cfg.icon
                    return (
                      <motion.div key={d.id} variants={listItemVariants} initial="hidden" animate="visible" transition={{ delay: i * 0.04 }}>
                        <CardFinance className="!p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-lyra-gold/10 border border-lyra-gold/15 flex items-center justify-center">
                                <FileText className="w-4 h-4 text-lyra-gold" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-lyra-cream">D&eacute;claration TVA {d.period}</p>
                                <p className="text-xs text-white/50">D&eacute;pos&eacute;e le {d.createdAt}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-lyra-cream">{fmt(d.netDue)} FCFA</p>
                              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>
                                <Icon className="w-3 h-3" />{cfg.label}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-6 mt-2 text-[10px] text-white/30">
                            <span>TVA Collect&eacute;e: {fmt(d.totalCollected)}</span>
                            <span>TVA D&eacute;ductible: {fmt(d.totalDeductible)}</span>
                          </div>
                        </CardFinance>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* SIMULATOR TAB */}
            {activeTab === 'simulator' && (
              <motion.div key="simulator" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CardFinance>
                    <h3 className="text-sm font-semibold text-lyra-cream mb-4 flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-lyra-gold" />
                      Simulateur TVA 18%
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-white/40 block mb-1.5">Montant Hors Taxe (HT)</label>
                        <input type="number" value={htAmount || ''}
                          onChange={e => setHtAmount(Number(e.target.value) || 0)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-lg text-lyra-cream font-bold focus:outline-none focus:border-lyra-gold/40 transition-colors"
                        />
                      </div>
                      <div className="text-xs text-white/30">
                        Taux appliqu&eacute;: <span className="text-lyra-gold font-bold">{TVA_RATE}%</span>
                      </div>
                    </div>
                  </CardFinance>

                  <CardFinance>
                    <h3 className="text-sm font-semibold text-lyra-cream mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-lyra-gold" />
                      R&eacute;sultat
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="text-white/50 text-sm">Montant HT</span>
                        <span className="text-lyra-cream font-bold text-lg">{fmt(htAmount)} FCFA</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-white/10">
                        <span className="flex items-center gap-1.5 text-white/50 text-sm">
                          <Percent className="w-3 h-3 text-lyra-gold" />
                          TVA {TVA_RATE}%
                        </span>
                        <span className="text-lyra-gold font-bold text-lg">{fmt(tvaCalculated)} FCFA</span>
                      </div>
                      <motion.div
                        key={htAmount}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        className="flex justify-between py-3"
                      >
                        <span className="text-lyra-cream font-semibold text-sm">Montant TTC</span>
                        <span className="text-emerald-400 font-bold text-xl">{fmt(ttcAmount)} FCFA</span>
                      </motion.div>
                    </div>
                  </CardFinance>
                </div>
              </motion.div>
            )}

            {/* PARAMS TAB */}
            {activeTab === 'params' && (
              <motion.div key="params" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <CardFinance>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-lyra-gold/10 border border-lyra-gold/20 flex items-center justify-center">
                        <Percent className="w-5 h-5 text-lyra-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-lyra-cream">Taux de TVA</p>
                        <p className="text-xs text-white/40">R&eacute;gime normal</p>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-lyra-gold">{TVA_RATE}%</div>
                  </CardFinance>

                  <CardFinance>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-lyra-gold/10 border border-lyra-gold/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-lyra-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-lyra-cream">P&eacute;riode D&eacute;clarative</p>
                        <p className="text-xs text-white/40">D&eacute;claration mensuelle</p>
                      </div>
                    </div>
                    <div className="text-lg font-medium text-lyra-cream">Chaque 15 du mois</div>
                  </CardFinance>

                  <CardFinance>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-lyra-gold/10 border border-lyra-gold/20 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-lyra-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-lyra-cream">R&eacute;gime</p>
                        <p className="text-xs text-white/40">R&eacute;el simplifi&eacute;</p>
                      </div>
                    </div>
                    <div className="text-lg font-medium text-lyra-cream">Chiffre d'affaires &lt; 50M FCFA</div>
                  </CardFinance>

                  <CardFinance>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-lyra-gold/10 border border-lyra-gold/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-lyra-gold" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-lyra-cream">P&eacute;nalit&eacute;s</p>
                        <p className="text-xs text-white/40">Retard de d&eacute;claration</p>
                      </div>
                    </div>
                    <div className="text-lg font-medium text-red-400">10% + 1.5%/mois</div>
                  </CardFinance>
                </StaggerContainer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </AppShell>
  )
}
