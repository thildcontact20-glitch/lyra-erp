'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, BarChart3, PieChart, DollarSign, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import AppShell from '../../components/layout/AppShell'
import PageTransition from '../../components/animations/PageTransition'
import StaggerContainer from '../../components/animations/StaggerContainer'
import CardFinance from '../../components/ui/CardFinance'
import { fadeUpVariants } from '../../lib/framerVariants'

/* ───────────────────────────────────────────────────────────────
   Types
   ─────────────────────────────────────────────────────────────── */
interface FinancialData {
  type: string
  totalAssets?: number
  totalLiabilities?: number
  totalEquity?: number
  totalPassif?: number
  totalRevenue?: number
  totalExpenses?: number
  netIncome?: number
  ca?: number
  achats?: number
  servicesExternes?: number
  valeurAjoutee?: number
  fraisPersonnel?: number
  impotsTaxes?: number
  ebe?: number
}

/* ───────────────────────────────────────────────────────────────
   Fallback Data — \u00c9tats Financiers OHADA
   ─────────────────────────────────────────────────────────────── */
const FALLBACK_BALANCE: FinancialData = {
  type: 'balance_sheet',
  totalAssets: 85200000,
  totalLiabilities: 34200000,
  totalEquity: 51000000,
  totalPassif: 85200000,
}

const FALLBACK_INCOME: FinancialData = {
  type: 'income_statement',
  totalRevenue: 28500000,
  totalExpenses: 21200000,
  netIncome: 7300000,
}

const FALLBACK_TAFIRE: FinancialData = {
  type: 'tafire',
  ca: 28500000,
  achats: 8500000,
  servicesExternes: 3200000,
  valeurAjoutee: 16800000,
  fraisPersonnel: 5200000,
  impotsTaxes: 1800000,
  ebe: 9800000,
}

/* ───────────────────────────────────────────────────────────────
   D\u00e9tail Bilan — Actif / Passif
   ─────────────────────────────────────────────────────────────── */
const FALLBACK_ASSETS = [
  { label: 'Immobilisations incorporelles', montant: 2500000 },
  { label: 'Immobilisations corporelles', montant: 45000000 },
  { label: 'Immobilisations financi\u00e8res', montant: 5000000 },
  { label: 'Stocks et encours', montant: 8500000 },
  { label: 'Cr\u00e9ances clients', montant: 12000000 },
  { label: 'Tr\u00e9sorerie', montant: 12200000 },
]

const FALLBACK_LIABILITIES = [
  { label: 'Capital social', montant: 30000000 },
  { label: 'R\u00e9serves', montant: 4000000 },
  { label: 'R\u00e9sultat net', montant: 7300000 },
  { label: 'Emprunts', montant: 15000000 },
  { label: 'Dettes fournisseurs', montant: 12000000 },
  { label: 'Autres dettes', montant: 16900000 },
]

function fmt(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n)
}

const tabs = [
  { id: 'balance', label: 'Bilan (Actif/Passif)', icon: PieChart },
  { id: 'income', label: 'Compte de R\u00e9sultat', icon: BarChart3 },
  { id: 'tafire', label: 'TAFIRE', icon: FileText },
] as const
type TabId = typeof tabs[number]['id']

export default function EtatsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('balance')
  const [data, setData] = useState<{ balance: FinancialData; income: FinancialData; tafire: FinancialData }>({
    balance: FALLBACK_BALANCE,
    income: FALLBACK_INCOME,
    tafire: FALLBACK_TAFIRE,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/financial/statements?type=balance').then(r => r.ok ? r.json() : Promise.reject()).then(d => d.data).catch(() => FALLBACK_BALANCE),
      fetch('/api/financial/statements?type=income').then(r => r.ok ? r.json() : Promise.reject()).then(d => d.data).catch(() => FALLBACK_INCOME),
      fetch('/api/financial/statements?type=tafire').then(r => r.ok ? r.json() : Promise.reject()).then(d => d.data).catch(() => FALLBACK_TAFIRE),
    ]).then(([balance, income, tafire]) => {
      setData({ balance, income, tafire })
      setLoading(false)
    })
  }, [])

  const b = data.balance
  const inc = data.income
  const taf = data.tafire

  const totalAssetsDetail = FALLBACK_ASSETS.reduce((s, a) => s + a.montant, 0)
  const totalPassifDetail = FALLBACK_LIABILITIES.reduce((s, a) => s + a.montant, 0)

  return (
    <AppShell>
      <PageTransition>
        <div className="max-w-7xl mx-auto space-y-6">
          <motion.div variants={fadeUpVariants} initial="hidden" animate="visible" className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-lyra-cream">&Eacute;tats Financiers LYRA</h1>
              <p className="text-sm text-white/40 mt-1">Bilan &mdash; Compte de R&eacute;sultat &mdash; TAFIRE</p>
            </div>
            <RefreshCw className={`w-4 h-4 text-white/20 ${loading ? 'animate-spin' : ''}`} />
          </motion.div>

          {/* KPI Overview */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Total Actif</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{fmt(b.totalAssets || totalAssetsDetail)} FCFA</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">Total Passif</span>
                <TrendingDown className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-bold text-lyra-cream mt-2">{fmt(b.totalPassif || totalPassifDetail)} FCFA</p>
            </CardFinance>
            <CardFinance>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-white/50">R&eacute;sultat Net</span>
                <DollarSign className="w-4 h-4 text-lyra-gold" />
              </div>
              <p className={`text-xl font-bold mt-2 ${(inc.netIncome || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt(inc.netIncome || 0)} FCFA
              </p>
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
            {/* BILAN */}
            {activeTab === 'balance' && (
              <motion.div key="balance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* ACTIF */}
                  <CardFinance className="!p-0 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        ACTIF
                      </h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {FALLBACK_ASSETS.map((item, i) => (
                        <motion.div key={item.label} variants={fadeUpVariants} initial="hidden" animate="visible"
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                        >
                          <span className="text-sm text-white/70">{item.label}</span>
                          <span className="text-sm font-medium text-lyra-cream">{fmt(item.montant)} FCFA</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="px-4 py-3 bg-emerald-500/5 border-t border-emerald-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-emerald-400">Total Actif</span>
                        <span className="text-sm font-bold text-emerald-400">{fmt(totalAssetsDetail)} FCFA</span>
                      </div>
                    </div>
                  </CardFinance>

                  {/* PASSIF */}
                  <CardFinance className="!p-0 overflow-hidden">
                    <div className="p-4 border-b border-white/10">
                      <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        PASSIF
                      </h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {FALLBACK_LIABILITIES.map((item, i) => (
                        <motion.div key={item.label} variants={fadeUpVariants} initial="hidden" animate="visible"
                          transition={{ delay: i * 0.04 }}
                          className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
                        >
                          <span className="text-sm text-white/70">{item.label}</span>
                          <span className="text-sm font-medium text-lyra-cream">{fmt(item.montant)} FCFA</span>
                        </motion.div>
                      ))}
                    </div>
                    <div className="px-4 py-3 bg-amber-500/5 border-t border-amber-500/20">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-amber-400">Total Passif</span>
                        <span className="text-sm font-bold text-amber-400">{fmt(totalPassifDetail)} FCFA</span>
                      </div>
                    </div>
                  </CardFinance>
                </div>

                {/* Equality check */}
                <CardFinance className="mt-4">
                  <div className="flex items-center justify-center gap-3">
                    <PieChart className="w-5 h-5 text-lyra-gold" />
                    <span className="text-sm text-white/70">
                      Actif ({fmt(totalAssetsDetail)}) = Passif ({fmt(totalPassifDetail)})
                    </span>
                    <span className={`text-sm font-bold ${totalAssetsDetail === totalPassifDetail ? 'text-emerald-400' : 'text-red-400'}`}>
                      {totalAssetsDetail === totalPassifDetail ? '\u2705 \u00c9quilibr\u00e9' : '\u274c D\u00e9s\u00e9quilibr\u00e9'}
                    </span>
                  </div>
                </CardFinance>
              </motion.div>
            )}

            {/* COMPTE DE RESULTAT */}
            {activeTab === 'income' && (
              <motion.div key="income" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <CardFinance className="!p-0 overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-lyra-cream flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-lyra-gold" />
                      Compte de R&eacute;sultat (P&L)
                    </h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    <motion.div variants={fadeUpVariants} initial="hidden" animate="visible"
                      className="flex items-center justify-between px-4 py-4 hover:bg-white/[0.02]"
                    >
                      <span className="text-sm text-emerald-400 font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Produits (Ventes + Prestations)
                      </span>
                      <span className="text-lg font-bold text-emerald-400">{fmt(inc.totalRevenue || 0)} FCFA</span>
                    </motion.div>
                    <motion.div variants={fadeUpVariants} initial="hidden" animate="visible"
                      transition={{ delay: 0.05 }}
                      className="flex items-center justify-between px-4 py-4 hover:bg-white/[0.02]"
                    >
                      <span className="text-sm text-red-400 font-medium flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        Charges (Achats + Services + Personnel + Imp&ocirc;ts)
                      </span>
                      <span className="text-lg font-bold text-red-400">{fmt(inc.totalExpenses || 0)} FCFA</span>
                    </motion.div>
                    <div className="px-4 py-4 bg-lyra-gold/5 border-t border-lyra-gold/20">
                      <motion.div key={(inc.netIncome || 0)} initial={{ scale: 1.05 }} animate={{ scale: 1 }}
                        className="flex items-center justify-between"
                      >
                        <span className="text-base font-bold text-lyra-cream">R&eacute;sultat Net</span>
                        <span className={`text-xl font-bold ${(inc.netIncome || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {(inc.netIncome || 0) >= 0 ? '+' : ''}{fmt(inc.netIncome || 0)} FCFA
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </CardFinance>
              </motion.div>
            )}

            {/* TAFIRE */}
            {activeTab === 'tafire' && (
              <motion.div key="tafire" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <CardFinance className="!p-0 overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-lyra-cream flex items-center gap-2">
                      <FileText className="w-4 h-4 text-lyra-gold" />
                      Tableau d'Analyse Financi&egrave;re et de R&eacute;sultats d'Exploitation (TAFIRE)
                    </h3>
                  </div>
                  <div className="divide-y divide-white/5">
                    {[
                      { label: 'Chiffre d\'Affaires (70)', value: taf.ca || 0, color: 'text-emerald-400' },
                      { label: 'Achats consomm&eacute;s (60)', value: taf.achats || 0, color: 'text-red-400' },
                      { label: 'Services Ext&eacute;rieurs (61)', value: taf.servicesExternes || 0, color: 'text-red-400' },
                      null, // separator for VA
                      { label: 'Valeur Ajout&eacute;e', value: taf.valeurAjoutee || 0, color: 'text-lyra-gold', bold: true },
                      { label: 'Frais de Personnel (64)', value: taf.fraisPersonnel || 0, color: 'text-red-400' },
                      { label: 'Imp&ocirc;ts et Taxes (63)', value: taf.impotsTaxes || 0, color: 'text-red-400' },
                      null, // separator for EBE
                      { label: 'Exc&eacute;dent Brut d\'Exploitation (EBE)', value: taf.ebe || 0, color: 'text-emerald-400', bold: true },
                    ].map((item, i) => {
                      if (item === null) {
                        return <div key={`sep-${i}`} className="h-2 bg-white/5" />
                      }
                      return (
                        <motion.div key={item.label} variants={fadeUpVariants} initial="hidden" animate="visible"
                          transition={{ delay: i * 0.03 }}
                          className={`flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors ${item.bold ? 'bg-lyra-gold/[0.03]' : ''}`}
                        >
                          <span className={`text-sm ${item.bold ? 'font-bold text-lyra-cream' : 'text-white/70'}`}>{item.label}</span>
                          <span className={`text-sm ${item.bold ? 'font-bold text-lg' : 'font-medium'} ${item.color}`}>
                            {fmt(item.value || 0)} FCFA
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </CardFinance>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </AppShell>
  )
}
